# CRITICAL FIXES NEEDED

## Issue 1: Budget Creation 500 Error

The schema has `Incoterm` as a model (table) but the code treats it as an enum.

### Fix 1: Update budget.repository.ts (line 48-78)

Replace the `create` method:

```typescript
async create(data: {
  clientId: string;
  incotermId: string;  // CHANGED from Incoterm to string
  organizationId?: string;
  totalAmount?: Decimal;
  budgetItems: any[];
  costs?: any[];
}) {
  return prisma.budget.create({
    data: {
      clientId: data.clientId,
      incotermId: data.incotermId,  // CHANGED
      organizationId: data.organizationId,
      totalAmount: data.totalAmount,
      budgetItems: {
        create: data.budgetItems,
      },
      costs: data.costs
        ? {
          connect: data.costs.map((costId) => ({ id: costId })),
        }
        : undefined,
    },
    include: {
      client: true,
      incoterm: true,  // ADD THIS
      budgetItems: {
        include: {
          product: true,
        },
      },
      costs: true,
    },
  });
}
```

### Fix 2: Update budget.service.ts (line 17-89)

Change the createBudget method:

```typescript
async createBudget(data: {
  clientId: string;
  incoterm: string;  // CHANGED: now expects incoterm NAME (e.g., "FOB")
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  costIds?: string[];
}) {
  // NEW: Find the incoterm by name to get its ID
  const incoterm = await prisma.incoterm.findUnique({
    where: { name: data.incoterm },
  });

  if (!incoterm) {
    throw new AppError(400, `Invalid incoterm: ${data.incoterm}`);
  }

  // Get user's organization
  const user = await prisma.user.findFirst();
  const organizationId = user?.organizationId || null;

  // ... rest of the code stays the same until line 81 ...

  // Create budget with calculation breakdowns
  const budget = await budgetRepository.create({
    clientId: data.clientId,
    incotermId: incoterm.id,  // CHANGED: use incotermId
    organizationId,  // ADD THIS
    totalAmount: toPrismaDecimal(calculation.totalAmount),
    budgetItems,
    costs: data.costIds,
  });

  return budget;
}
```

### Fix 3: Update budget.repository.ts imports (line 5)

Change:
```typescript
import { PrismaClient, Incoterm, BudgetStatus, Decimal } from '@prisma/client';
```

To:
```typescript
import { PrismaClient, BudgetStatus, Decimal } from '@prisma/client';
```

## Issue 2: Pricing Calculator Error

The pricing calculator controller needs to handle the Incoterm lookup.

### Fix: Update pricing-calculator.controller.ts (line 30-50)

In the `calculatePricing` function, add Incoterm lookup:

```typescript
export const calculatePricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request
    const validatedData = calculatePricingSchema.parse(req.body);

    // Get organization ID from authenticated user
    const organizationId = (req as any).user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: 'Organization ID required' });
    }

    // Calculate pricing
    const result = await pricingService.calculateExportPrice(
      validatedData as PricingCalculationRequest,
      organizationId
    );

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    next(error);
  }
};
```

The pricing calculator should work as-is since it expects incoterm NAME not ID.

## Quick Test After Fixes

1. Restart backend: `docker-compose restart backend`
2. Try creating a budget
3. Try Calculate Pricing button
