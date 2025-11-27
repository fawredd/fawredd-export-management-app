import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/error.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * Public routes - no authentication required
 * These endpoints are accessible to prospects/anonymous users
 */

// GET /api/public/catalog/:userId - Get public product catalog for a manufacturer/trader
router.get('/catalog/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Get user to verify they are a manufacturer or trader
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user || (user.role !== 'MANUFACTURER' && user.role !== 'TRADER')) {
      throw new AppError(404, 'Catalog not found');
    }

    // Get public products from this user's providers
    const products = await prisma.product.findMany({
      where: {
        isPublic: true,
        provider: {
          // Assuming providers are linked to users somehow
          // You may need to adjust this based on your actual schema
        },
      },
      include: {
        tariffPosition: true,
        unit: true,
        provider: {
          select: {
            id: true,
            name: true,
          },
        },
        priceHistory: {
          where: { type: 'SELLING' },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/budget/:shareToken - Get budget by share token
router.get('/budget/:shareToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shareToken } = req.params;

    const budget = await prisma.budget.findUnique({
      where: { shareToken },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        budgetItems: {
          include: {
            product: {
              include: {
                tariffPosition: true,
                unit: true,
                provider: true,
              },
            },
          },
        },
        costs: true,
      },
    });

    if (!budget) {
      throw new AppError(404, 'Budget not found or link has expired');
    }

    // Check if budget has expired
    if (budget.expiresAt && new Date(budget.expiresAt) < new Date()) {
      await prisma.budget.update({
        where: { id: budget.id },
        data: { status: 'EXPIRED' },
      });
      throw new AppError(410, 'This budget link has expired');
    }

    // Increment view count and update status if first view
    await prisma.budget.update({
      where: { id: budget.id },
      data: {
        viewCount: { increment: 1 },
        status: budget.status === 'SENT' ? 'VIEWED' : budget.status,
      },
    });

    res.json(budget);
  } catch (error) {
    next(error);
  }
});

// POST /api/public/budget/:shareToken/accept - Accept a budget (prospect becomes client)
router.post('/budget/:shareToken/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shareToken } = req.params;
    const { prospectName, prospectEmail, prospectPhone, prospectAddress, prospectTaxId } = req.body;

    if (!prospectName || !prospectEmail) {
      throw new AppError(400, 'Prospect name and email are required');
    }

    const budget = await prisma.budget.findUnique({
      where: { shareToken },
      include: { client: true },
    });

    if (!budget) {
      throw new AppError(404, 'Budget not found');
    }

    if (budget.expiresAt && new Date(budget.expiresAt) < new Date()) {
      throw new AppError(410, 'This budget link has expired');
    }

    if (budget.status === 'APPROVED') {
      throw new AppError(400, 'This budget has already been accepted');
    }

    // Check if client already exists with this email
    let client = await prisma.client.findFirst({
      where: { email: prospectEmail },
    });

    // If client doesn't exist, create new one
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: prospectName,
          email: prospectEmail,
          phone: prospectPhone,
          address: prospectAddress,
          taxId: prospectTaxId,
          convertedFrom: shareToken, // Track conversion source
        },
      });
    }

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id: budget.id },
      data: {
        status: 'APPROVED',
        acceptedAt: new Date(),
        acceptedBy: prospectEmail,
        clientId: client.id, // Link to the client
      },
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      message: 'Budget accepted successfully',
      budget: updatedBudget,
      client,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
