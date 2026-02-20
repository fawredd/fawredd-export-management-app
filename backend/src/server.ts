/**
 * Main server entry point for the Export Management API
 * Sets up Express server with middleware, routes, and error handling
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import routes
import authRoutes from './routes/auth.routes';
import budgetRoutes from './routes/budget.routes';
import productRoutes from './routes/product.routes';
import providerRoutes from './routes/provider.routes';
import clientRoutes from './routes/client.routes';
import costRoutes from './routes/cost.routes';
import tariffPositionRoutes from './routes/tariff-position.routes';
import unitOfMeasureRoutes from './routes/unit-of-measure.routes';
import countryRoutes from './routes/country.routes';
import exportTaskRoutes from './routes/export-task.routes';
import taxRoutes from './routes/tax.routes';
import priceHistoryRoutes from './routes/price-history.routes';
import invoiceRoutes from './routes/invoice.routes';
import packingListRoutes from './routes/packing-list.routes';
import publicRoutes from './routes/public.routes';
import userRoutes from './routes/user.routes';
import bulkImportRoutes from './routes/bulk-import.routes';
import pricingRoutes from './routes/pricing.routes';

// Import middleware
import { errorHandler } from './middlewares/error.middleware';
import { idempotency } from './middlewares/idempotency.middleware';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust Vercel's proxy for express-rate-limit
app.set('trust proxy', 1);

// Logger setup — pino-pretty is local-only; Vercel uses plain JSON logs
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(process.env.VERCEL !== '1' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

const httpLogger = pinoHttp({ logger });

// Middleware
app.use(httpLogger);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files (only on local/Docker — Vercel uses blob storage)
if (process.env.VERCEL !== '1') {
  app.use('/uploads', express.static('uploads'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/', idempotency);

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 requests per 15 minutes for auth endpoints
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/', authLimiter);

// Swagger/OpenAPI setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Export Management API',
      version: '1.0.0',
      description: 'API for managing export operations, budgets, and logistics',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Export Management API',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

// Mount public routes (no authentication required)
app.use('/api/public', publicRoutes);

// Mount API routes (authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/products', productRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/costs', costRoutes);
app.use('/api/tariff-positions', tariffPositionRoutes);
app.use('/api/units', unitOfMeasureRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/export-tasks', exportTaskRoutes);
app.use('/api/taxes', taxRoutes);
app.use('/api/price-history', priceHistoryRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/packing-lists', packingListRoutes);
app.use('/api/bulk-import', bulkImportRoutes);
app.use('/api/pricing', pricingRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    const { connectRedis } = await import('./utils/redis-client');
    await connectRedis();

    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        logger.info(`🚀 Server running on http://localhost:${PORT}`);
        logger.info(`📚 API Documentation available at http://localhost:${PORT}/api/docs`);
        logger.info(`🏥 Health check available at http://localhost:${PORT}/health`);
      });
    }
  } catch (error) {
    logger.error('Failed to start server:', error as any);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

startServer();

export default app;
