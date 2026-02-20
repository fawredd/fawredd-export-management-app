var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils/redis-client.ts
var redis_client_exports = {};
__export(redis_client_exports, {
  connectRedis: () => connectRedis,
  default: () => redis_client_default
});
import { createClient } from "redis";
var client, connectRedis, redis_client_default;
var init_redis_client = __esm({
  "src/utils/redis-client.ts"() {
    "use strict";
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379"
    });
    client.on("error", (err) => {
      console.log("Redis Client Error", err);
    });
    connectRedis = async () => {
      if (!client.isOpen) {
        await client.connect();
        console.log("Redis Client connected");
      }
    };
    redis_client_default = client;
  }
});

// src/middlewares/upload.middleware.ts
var upload_middleware_exports = {};
__export(upload_middleware_exports, {
  deleteFile: () => deleteFile,
  getFileUrl: () => getFileUrl,
  upload: () => upload
});
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadsDir, storage, fileFilter, upload, deleteFile, getFileUrl;
var init_upload_middleware = __esm({
  "src/middlewares/upload.middleware.ts"() {
    "use strict";
    uploadsDir = path.join(process.cwd(), "uploads/products");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        const basename = path.basename(file.originalname, ext);
        cb(null, `${basename}-${uniqueSuffix}${ext}`);
      }
    });
    fileFilter = (_req, file, cb) => {
      const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."));
      }
    };
    upload = multer({
      storage,
      fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024
        // 5MB max file size
      }
    });
    deleteFile = (filePath) => {
      const fullPath = path.join(process.cwd(), "uploads/products", path.basename(filePath));
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    };
    getFileUrl = (filename, req) => {
      const protocol = req.protocol;
      const host = req.get("host");
      return `${protocol}://${host}/uploads/products/${filename}`;
    };
  }
});

// src/services/pdf-generator.service.ts
var pdf_generator_service_exports = {};
__export(pdf_generator_service_exports, {
  PdfGeneratorService: () => PdfGeneratorService,
  pdfGeneratorService: () => pdfGeneratorService
});
import PDFDocument from "pdfkit";
import fs2 from "fs";
import path2 from "path";
var pdfsDir, PdfGeneratorService, pdfGeneratorService;
var init_pdf_generator_service = __esm({
  "src/services/pdf-generator.service.ts"() {
    "use strict";
    pdfsDir = path2.join(__dirname, "../../uploads/pdfs");
    if (!fs2.existsSync(pdfsDir)) {
      fs2.mkdirSync(pdfsDir, { recursive: true });
    }
    PdfGeneratorService = class {
      /**
       * Generate Invoice PDF
       */
      async generateInvoice(invoiceData) {
        return new Promise((resolve, reject) => {
          try {
            const filename = `invoice-${invoiceData.id}-${Date.now()}.pdf`;
            const filepath = path2.join(pdfsDir, filename);
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs2.createWriteStream(filepath);
            doc.pipe(stream);
            doc.fontSize(20).text("PROFORMA INVOICE", { align: "center" });
            doc.moveDown();
            doc.fontSize(10);
            doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 50, 100);
            doc.text(`Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, 50, 115);
            doc.text(`Status: ${invoiceData.status}`, 50, 130);
            doc.text("Bill To:", 50, 160);
            doc.fontSize(12).text(invoiceData.budget?.client?.name || "N/A", 50, 175);
            if (invoiceData.budget?.client?.email) {
              doc.fontSize(10).text(invoiceData.budget.client.email, 50, 190);
            }
            if (invoiceData.budget?.client?.address) {
              doc.text(invoiceData.budget.client.address, 50, 205);
            }
            doc.text(`Incoterm: ${invoiceData.budget?.incoterm || "N/A"}`, 350, 160);
            doc.text(`Total Amount: $${Number(invoiceData.totalAmount).toFixed(2)}`, 350, 175);
            doc.moveTo(50, 240).lineTo(550, 240).stroke();
            let yPosition = 260;
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Item", 50, yPosition);
            doc.text("Qty", 300, yPosition);
            doc.text("Unit Price", 370, yPosition);
            doc.text("Total", 480, yPosition);
            yPosition += 20;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 10;
            doc.font("Helvetica");
            if (invoiceData.budget?.budgetItems) {
              for (const item of invoiceData.budget.budgetItems) {
                if (yPosition > 700) {
                  doc.addPage();
                  yPosition = 50;
                }
                doc.text(item.product?.title || "Product", 50, yPosition, { width: 240 });
                doc.text(item.quantity.toString(), 300, yPosition);
                doc.text(`$${Number(item.unitPrice).toFixed(2)}`, 370, yPosition);
                doc.text(`$${Number(item.totalLine).toFixed(2)}`, 480, yPosition);
                yPosition += 25;
              }
            }
            yPosition += 20;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 15;
            doc.fontSize(12).font("Helvetica-Bold");
            doc.text("TOTAL:", 370, yPosition);
            doc.text(`$${Number(invoiceData.totalAmount).toFixed(2)}`, 480, yPosition);
            doc.fontSize(8).font("Helvetica");
            doc.text("This is a proforma invoice and does not constitute a tax invoice.", 50, 750, {
              align: "center",
              width: 500
            });
            doc.end();
            stream.on("finish", () => {
              resolve(`/uploads/pdfs/${filename}`);
            });
            stream.on("error", reject);
          } catch (error) {
            reject(error);
          }
        });
      }
      /**
       * Generate Packing List PDF
       */
      async generatePackingList(packingListData) {
        return new Promise((resolve, reject) => {
          try {
            const filename = `packing-list-${packingListData.id}-${Date.now()}.pdf`;
            const filepath = path2.join(pdfsDir, filename);
            const doc = new PDFDocument({ margin: 50 });
            const stream = fs2.createWriteStream(filepath);
            doc.pipe(stream);
            doc.fontSize(20).text("PACKING LIST", { align: "center" });
            doc.moveDown();
            doc.fontSize(10);
            doc.text(`Packing List Number: ${packingListData.listNumber}`, 50, 100);
            doc.text(`Date: ${new Date(packingListData.issueDate).toLocaleDateString()}`, 50, 115);
            doc.text("Ship To:", 50, 145);
            doc.fontSize(12).text(packingListData.budget?.client?.name || "N/A", 50, 160);
            if (packingListData.budget?.client?.address) {
              doc.fontSize(10).text(packingListData.budget.client.address, 50, 175);
            }
            doc.text(`Total Weight: ${Number(packingListData.totalWeight).toFixed(2)} kg`, 350, 145);
            doc.text(`Total Volume: ${Number(packingListData.totalVolume).toFixed(3)} m\xB3`, 350, 160);
            doc.text(`Number of Packages: ${packingListData.numberOfPackages}`, 350, 175);
            doc.moveTo(50, 210).lineTo(550, 210).stroke();
            let yPosition = 230;
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Item", 50, yPosition);
            doc.text("SKU", 250, yPosition);
            doc.text("Qty", 350, yPosition);
            doc.text("Weight (kg)", 420, yPosition);
            yPosition += 20;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 10;
            doc.font("Helvetica");
            if (packingListData.budget?.budgetItems) {
              for (const item of packingListData.budget.budgetItems) {
                if (yPosition > 700) {
                  doc.addPage();
                  yPosition = 50;
                }
                const productWeight = item.product?.weightKg ? (item.product.weightKg * item.quantity).toFixed(2) : "N/A";
                doc.text(item.product?.title || "Product", 50, yPosition, { width: 190 });
                doc.text(item.product?.sku || "N/A", 250, yPosition);
                doc.text(item.quantity.toString(), 350, yPosition);
                doc.text(productWeight, 420, yPosition);
                yPosition += 25;
              }
            }
            yPosition += 20;
            doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
            yPosition += 15;
            doc.fontSize(11).font("Helvetica-Bold");
            doc.text("TOTALS:", 50, yPosition);
            doc.text(`Weight: ${Number(packingListData.totalWeight).toFixed(2)} kg`, 350, yPosition);
            yPosition += 15;
            doc.text(`Volume: ${Number(packingListData.totalVolume).toFixed(3)} m\xB3`, 350, yPosition);
            yPosition += 15;
            doc.text(`Packages: ${packingListData.numberOfPackages}`, 350, yPosition);
            doc.fontSize(8).font("Helvetica");
            doc.text("Please verify all items upon receipt.", 50, 750, { align: "center", width: 500 });
            doc.end();
            stream.on("finish", () => {
              resolve(`/uploads/pdfs/${filename}`);
            });
            stream.on("error", reject);
          } catch (error) {
            reject(error);
          }
        });
      }
    };
    pdfGeneratorService = new PdfGeneratorService();
  }
});

// src/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import pino from "pino";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// src/routes/auth.routes.ts
import { Router } from "express";

// src/repositories/user.repository.ts
init_redis_client();
import { PrismaClient } from "@prisma/client";
var prisma = new PrismaClient();
var CACHE_TTL = 60 * 60 * 24;
var CACHE_KEY = "users";
var UserRepository = class {
  async findById(id, organizationId) {
    const cachedUser = await redis_client_default.get(`${CACHE_KEY}:${id}`);
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (!organizationId || parsed.organizationId === organizationId) {
        return parsed;
      }
    }
    const user = await prisma.user.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (user) {
      await redis_client_default.set(`${CACHE_KEY}:${id}`, JSON.stringify(user), {
        EX: CACHE_TTL
      });
    }
    return user;
  }
  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }
  async create(data) {
    const user = await prisma.user.create({ data });
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async findAll(organizationId) {
    return prisma.user.findMany({
      where: organizationId ? { organizationId } : void 0,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
  async update(id, data, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    const user = await prisma.user.update({
      where: { id },
      data
    });
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.user.delete({ where: { id } });
  }
};

// src/utils/password.util.ts
import bcrypt from "bcryptjs";
var SALT_ROUNDS = 10;
var hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};
var comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// src/utils/jwt.util.ts
import jwt from "jsonwebtoken";
var generateToken = (payload) => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

// src/middlewares/error.middleware.ts
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
var AppError = class _AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, _AppError.prototype);
  }
};
var errorHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...process.env.NODE_ENV === "development" && { stack: err.stack }
    });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation Error",
      message: "Invalid input data",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message
      }))
    });
    return;
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const fieldName = target?.[0] || "field";
      res.status(409).json({
        error: "Conflict",
        message: `A record with this ${fieldName} already exists`,
        field: fieldName
      });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({
        error: "Not Found",
        message: "Record not found"
      });
      return;
    }
  }
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
};

// src/services/auth.service.ts
var userRepository = new UserRepository();
var AuthService = class {
  async register(data) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, "User with this email already exists");
    }
    const hashedPassword = await hashPassword(data.password);
    const user = await userRepository.create({
      ...data,
      password: hashedPassword
    });
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      },
      token
    };
  }
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    const genericErrorMessage = "Invalid email or password";
    if (!user) {
      throw new AppError(401, genericErrorMessage);
    }
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, genericErrorMessage);
    }
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId
      },
      token
    };
  }
};

// src/controllers/auth.controller.ts
var authService = new AuthService();
var AuthController = class {
  setTokenCookie(res, token) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      path: "/"
    });
  }
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      this.setTokenCookie(res, result.token);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      this.setTokenCookie(res, result.token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  async logout(_req, res, next) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      });
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
  async me(req, res, next) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
};

// src/middlewares/validation.middleware.ts
import { ZodError as ZodError2 } from "zod";
var validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError2) {
        res.status(400).json({
          error: "Validation Error",
          details: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
        return;
      }
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};

// src/middlewares/auth.middleware.ts
import jwt2 from "jsonwebtoken";
var authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    if (!token) {
      res.status(401).json({ error: "Unauthorized", message: "No token provided" });
      return;
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt2.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt2.JsonWebTokenError) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
      return;
    }
    if (error instanceof jwt2.TokenExpiredError) {
      res.status(401).json({ error: "Unauthorized", message: "Token expired" });
      return;
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
};
var authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: "You do not have permission to access this resource"
      });
      return;
    }
    next();
  };
};

// src/utils/validation-schemas.ts
import { z } from "zod";
import { Role as Role2, TaskStatus, CostType, BudgetStatus } from "@prisma/client";
var registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").regex(/[a-z]/, "Password must contain at least one lowercase letter").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number").regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    name: z.string().optional(),
    role: z.nativeEnum(Role2).optional()
  })
});
var loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
  })
});
var createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1, "SKU is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    weightKg: z.number().positive().optional(),
    volumeM3: z.number().positive().optional(),
    composition: z.string().optional(),
    tariffPositionId: z.string().optional(),
    unitId: z.string().optional(),
    providerId: z.string().optional()
  })
});
var updateProductSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    sku: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    weightKg: z.number().positive().optional(),
    volumeM3: z.number().positive().optional(),
    composition: z.string().optional(),
    tariffPositionId: z.string().optional(),
    unitId: z.string().optional(),
    providerId: z.string().optional()
  })
});
var createProviderSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional()
  })
});
var updateProviderSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional()
  })
});
var createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional()
  })
});
var updateClientSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    taxId: z.string().optional()
  })
});
var VALID_INCOTERMS = ["EXW", "FCA", "FAS", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DPU", "DDP"];
var createBudgetSchema = z.object({
  body: z.object({
    clientId: z.string().min(1, "Client ID is required"),
    incoterm: z.enum(VALID_INCOTERMS, {
      errorMap: () => ({ message: `Invalid incoterm. Must be one of: ${VALID_INCOTERMS.join(", ")}` })
    }),
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive()
      })
    ).min(1, "At least one item is required"),
    costIds: z.array(z.string()).optional(),
    expenses: z.array(
      z.object({
        id: z.string().optional(),
        description: z.string(),
        value: z.number(),
        type: z.string().optional()
      })
    ).optional()
  })
});
var updateBudgetStatusSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    status: z.nativeEnum(BudgetStatus)
  })
});
var createCostSchema = z.object({
  body: z.object({
    type: z.nativeEnum(CostType),
    description: z.string().optional(),
    value: z.number().positive("Value must be positive")
  })
});
var createExportTaskSchema = z.object({
  body: z.object({
    description: z.string().min(1, "Description is required"),
    countryId: z.string().min(1, "Country ID is required"),
    productIds: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional()
  })
});
var updateExportTaskSchema = z.object({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    countryId: z.string().optional(),
    productIds: z.array(z.string()).optional(),
    dueDate: z.string().datetime().optional()
  })
});

// src/routes/auth.routes.ts
var router = Router();
var authController = new AuthController();
router.post("/register", validate(registerSchema), authController.register.bind(authController));
router.post("/login", validate(loginSchema), authController.login.bind(authController));
router.get("/me", authenticate, authController.me.bind(authController));
router.post("/logout", authController.logout.bind(authController));
var auth_routes_default = router;

// src/routes/budget.routes.ts
import { Router as Router2 } from "express";

// src/repositories/budget.repository.ts
import { PrismaClient as PrismaClient2 } from "@prisma/client";
var prisma2 = new PrismaClient2();
var BudgetRepository = class {
  async findAll(organizationId) {
    return prisma2.budget.findMany({
      where: organizationId ? { organizationId } : void 0,
      include: {
        client: true,
        incoterm: true,
        budgetItems: {
          include: {
            product: true
          }
        },
        costs: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async findById(id, organizationId) {
    return prisma2.budget.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        client: true,
        incoterm: true,
        budgetItems: {
          include: {
            product: {
              include: {
                tariffPosition: true,
                unit: true,
                taxes: true
              }
            }
          }
        },
        costs: true,
        invoices: true,
        packingLists: true
      }
    });
  }
  async create(data) {
    return prisma2.budget.create({
      data: {
        client: { connect: { id: data.clientId } },
        incoterm: { connect: { id: data.incotermId } },
        organization: data.organizationId ? { connect: { id: data.organizationId } } : void 0,
        totalAmount: data.totalAmount,
        budgetItems: {
          create: data.budgetItems
        },
        costs: data.costs?.length ? {
          connect: data.costs.map((costId) => ({ id: costId }))
        } : void 0
      },
      include: {
        client: true,
        incoterm: true,
        budgetItems: {
          include: {
            product: true
          }
        },
        costs: true
      }
    });
  }
  async updateStatus(id, status, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma2.budget.update({
      where: { id },
      data: { status },
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true
          }
        }
      }
    });
  }
  async update(id, data) {
    return prisma2.budget.update({
      where: { id },
      data,
      include: {
        client: true,
        budgetItems: {
          include: {
            product: true
          }
        }
      }
    });
  }
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma2.budget.delete({ where: { id } });
  }
};
var budget_repository_default = new BudgetRepository();

// src/repositories/product.repository.ts
import { PrismaClient as PrismaClient3 } from "@prisma/client";
var prisma3 = new PrismaClient3();
var ProductRepository = class {
  async findAll(organizationId) {
    return prisma3.product.findMany({
      where: organizationId ? { organizationId } : void 0,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
        priceHistory: {
          orderBy: { date: "desc" }
        }
      }
    });
  }
  async findById(id, organizationId) {
    return prisma3.product.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        tariffPosition: true,
        unit: true,
        provider: true,
        priceHistory: {
          orderBy: { date: "desc" }
        },
        taxes: true
      }
    });
  }
  async findBySku(sku, organizationId) {
    return prisma3.product.findFirst({
      where: {
        sku,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        tariffPosition: true,
        unit: true,
        provider: true
      }
    });
  }
  async create(data) {
    return prisma3.product.create({
      data,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true
      }
    });
  }
  async update(id, data, organizationId) {
    return prisma3.product.update({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      data,
      include: {
        tariffPosition: true,
        unit: true,
        provider: true
      }
    });
  }
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma3.product.delete({ where: { id } });
  }
};

// src/utils/budget-calculator.util.ts
import { Decimal } from "@prisma/client/runtime/library";
var calculateBudget = (items, costs, incoterm, dutyRate = 0) => {
  const subtotalProducts = items.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);
  const totalExpenses = costs.reduce((sum, cost) => sum + cost.value, 0);
  const totalFOB = subtotalProducts + totalExpenses;
  const calculatedItems = items.map((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const percentage = subtotalProducts > 0 ? itemSubtotal / subtotalProducts : 0;
    const proratedCosts = totalExpenses * percentage;
    const subtotalWithCosts = itemSubtotal + proratedCosts;
    const duties = subtotalWithCosts * (dutyRate / 100);
    const freight = 0;
    const insurance = 0;
    const totalLine = itemSubtotal + proratedCosts + duties;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      proratedCosts: Number(proratedCosts.toFixed(6)),
      duties: Number(duties.toFixed(6)),
      freight: Number(freight.toFixed(6)),
      insurance: Number(insurance.toFixed(6)),
      totalLine: Number(totalLine.toFixed(6))
    };
  });
  const totalCIF = totalFOB;
  let totalAmount;
  switch (incoterm.name) {
    case "EXW":
      totalAmount = subtotalProducts;
      break;
    case "FCA":
      totalAmount = subtotalProducts;
      break;
    case "FOB":
      totalAmount = totalFOB;
      break;
    case "CIF":
      totalAmount = totalCIF;
      break;
    case "DDP": {
      const totalDuties = calculatedItems.reduce((sum, item) => sum + item.duties, 0);
      totalAmount = totalCIF + totalDuties;
      break;
    }
    default:
      totalAmount = totalFOB;
  }
  return {
    items: calculatedItems,
    subtotalProducts: Number(subtotalProducts.toFixed(6)),
    totalExpenses: Number(totalExpenses.toFixed(6)),
    totalFOB: Number(totalFOB.toFixed(6)),
    totalCIF: Number(totalCIF.toFixed(6)),
    totalAmount: Number(totalAmount.toFixed(6))
  };
};
var toPrismaDecimal = (value) => {
  return new Decimal(value);
};

// src/services/budget.service.ts
import { PrismaClient as PrismaClient4 } from "@prisma/client";
import { nanoid } from "nanoid";
var budgetRepository = new BudgetRepository();
var productRepository = new ProductRepository();
var prisma4 = new PrismaClient4();
var BudgetService = class {
  async createBudget(data, organizationId) {
    console.log("Creating budget for client:", data.clientId, "incoterm:", data.incoterm);
    const incoterm = await prisma4.incoterm.findUnique({
      where: { name: data.incoterm }
    });
    if (!incoterm) {
      throw new AppError(400, `Invalid incoterm: ${data.incoterm}`);
    }
    const finalOrganizationId = organizationId || null;
    const products = await Promise.all(
      data.items.map((item) => productRepository.findById(item.productId, finalOrganizationId))
    );
    if (products.some((p) => !p)) {
      throw new AppError(404, "One or more products not found");
    }
    let costs = [];
    if (data.costIds && data.costIds.length > 0) {
      console.log("Fetching costs:", data.costIds);
      costs = await prisma4.cost.findMany({
        where: { id: { in: data.costIds }, organizationId: finalOrganizationId }
      });
      console.log("Found costs:", costs.length);
    }
    if (data.expenses && data.expenses.length > 0) {
      console.log("Creating ad-hoc expenses:", data.expenses.length);
      const newCosts = await Promise.all(
        data.expenses.map(async (exp) => {
          if (exp.id) {
            const existing = await prisma4.cost.findUnique({ where: { id: exp.id } });
            return existing;
          }
          return prisma4.cost.create({
            data: {
              type: exp.type || "FIXED",
              description: exp.description,
              value: toPrismaDecimal(exp.value),
              organizationId: finalOrganizationId,
              incotermToBeIncludedId: incoterm.id
              // Associate with current incoterm by default
            }
          });
        })
      );
      costs = [...costs, ...newCosts.filter(Boolean)];
    }
    const itemsWithDetails = data.items.map((item, index) => ({
      ...item,
      weightKg: products[index]?.weightKg || 0,
      volumeM3: products[index]?.volumeM3 || 0
    }));
    const costsForCalculation = costs.map((cost) => ({
      id: cost.id,
      name: cost.description || "Cost",
      type: cost.type,
      value: Number(cost.value)
    }));
    const calculation = calculateBudget(
      itemsWithDetails,
      costsForCalculation,
      data.incoterm,
      // The calculator expects the string name
      0
      // Default duty rate, can be customized per product
    );
    const budgetItems = calculation.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: toPrismaDecimal(item.unitPrice),
      proratedCosts: toPrismaDecimal(item.proratedCosts),
      duties: toPrismaDecimal(item.duties),
      freight: toPrismaDecimal(item.freight),
      insurance: toPrismaDecimal(item.insurance),
      totalLine: toPrismaDecimal(item.totalLine)
    }));
    console.log("Saving budget to repository...");
    const budget = await budgetRepository.create({
      clientId: data.clientId,
      incotermId: incoterm.id,
      // Use incotermId
      organizationId: finalOrganizationId,
      totalAmount: toPrismaDecimal(calculation.totalAmount),
      budgetItems,
      costs: costs.map((c) => c.id)
      // Only connect costs that were actually found
    });
    return budget;
  }
  async getAllBudgets(organizationId) {
    return budgetRepository.findAll(organizationId);
  }
  async getBudgetById(id, organizationId) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, "Budget not found");
    }
    return budget;
  }
  async updateBudgetStatus(id, status, organizationId) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, "Budget not found");
    }
    return budgetRepository.updateStatus(id, status, organizationId);
  }
  async deleteBudget(id, organizationId) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, "Budget not found");
    }
    return budgetRepository.delete(id, organizationId);
  }
  async generateShareToken(id, expiresInDays = 30, organizationId) {
    const budget = await budgetRepository.findById(id, organizationId);
    if (!budget) {
      throw new AppError(404, "Budget not found");
    }
    const shareToken = nanoid(32);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    return prisma4.budget.update({
      where: { id },
      data: {
        shareToken,
        expiresAt
      }
    });
  }
};

// src/controllers/budget.controller.ts
var budgetService = new BudgetService();
var BudgetController = class {
  async create(req, res, next) {
    try {
      const budget = await budgetService.createBudget(req.body, req.user?.organizationId);
      res.status(201).json(budget);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const budgets = await budgetService.getAllBudgets(req.user?.organizationId);
      res.json(budgets);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const budget = await budgetService.getBudgetById(req.params.id, req.user?.organizationId);
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }
  async updateStatus(req, res, next) {
    try {
      const budget = await budgetService.updateBudgetStatus(
        req.params.id,
        req.body.status,
        req.user?.organizationId
      );
      res.json(budget);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      await budgetService.deleteBudget(req.params.id, req.user?.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  async generateShareLink(req, res, next) {
    try {
      const { id } = req.params;
      const { expiresInDays } = req.body;
      const budget = await budgetService.generateShareToken(
        id,
        expiresInDays || 30,
        req.user?.organizationId
      );
      const protocol = req.protocol;
      const host = req.get("host");
      const shareUrl = `${protocol}://${host}/public/budget/${budget.shareToken}`;
      res.json({
        message: "Share link generated successfully",
        budget,
        shareUrl,
        expiresAt: budget.expiresAt
      });
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/budget.routes.ts
var router2 = Router2();
var budgetController = new BudgetController();
router2.use(authenticate);
router2.post(
  "/",
  authorize("ADMIN", "TRADER"),
  validate(createBudgetSchema),
  budgetController.create.bind(budgetController)
);
router2.get("/", budgetController.getAll.bind(budgetController));
router2.get("/:id", budgetController.getById.bind(budgetController));
router2.patch(
  "/:id/status",
  authorize("ADMIN", "TRADER"),
  validate(updateBudgetStatusSchema),
  budgetController.updateStatus.bind(budgetController)
);
router2.post(
  "/:id/share",
  authorize("ADMIN", "TRADER", "MANUFACTURER"),
  budgetController.generateShareLink.bind(budgetController)
);
router2.delete("/:id", authorize("ADMIN"), budgetController.delete.bind(budgetController));
var budget_routes_default = router2;

// src/routes/product.routes.ts
import { Router as Router3 } from "express";

// src/repositories/price-history.repository.ts
import { PrismaClient as PrismaClient5 } from "@prisma/client";
var prisma5 = new PrismaClient5();
var PriceHistoryRepository = class {
  /**
   * Find price history by product ID
   */
  async findByProductId(productId, type) {
    const where = { productId };
    if (type) where.type = type;
    return prisma5.priceHistory.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Find price history by ID
   */
  async findById(id) {
    return prisma5.priceHistory.findUnique({
      where: { id },
      include: {
        product: true
      }
    });
  }
  /**
   * Create new price history entry
   */
  async create(data) {
    return prisma5.priceHistory.create({
      data: {
        ...data,
        date: data.date || /* @__PURE__ */ new Date()
      },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Delete price history entry
   */
  async delete(id) {
    return prisma5.priceHistory.delete({
      where: { id }
    });
  }
  /**
   * Get latest price for a product
   */
  async getLatestPrice(productId, type) {
    return prisma5.priceHistory.findFirst({
      where: { productId, type },
      orderBy: { date: "desc" }
    });
  }
  /**
   * Get price history within date range
   */
  async findByDateRange(productId, startDate, endDate, type) {
    const where = {
      productId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };
    if (type) where.type = type;
    return prisma5.priceHistory.findMany({
      where,
      orderBy: { date: "asc" }
    });
  }
};
var price_history_repository_default = new PriceHistoryRepository();

// src/controllers/product.controller.ts
import { PriceType as PriceType2 } from "@prisma/client";
var productRepository2 = new ProductRepository();
var ProductController = class {
  async create(req, res, next) {
    try {
      const { costPrice, sellingPrice, ...productData } = req.body;
      const organizationId = req.user?.organizationId || null;
      const product = await productRepository2.create({ ...productData, organizationId });
      const priceHistoryPromises = [];
      if (costPrice !== void 0 && costPrice !== null) {
        priceHistoryPromises.push(
          price_history_repository_default.create({
            productId: product.id,
            type: PriceType2.COST,
            value: costPrice
          })
        );
      }
      if (sellingPrice !== void 0 && sellingPrice !== null) {
        priceHistoryPromises.push(
          price_history_repository_default.create({
            productId: product.id,
            type: PriceType2.SELLING,
            value: sellingPrice
          })
        );
      }
      await Promise.all(priceHistoryPromises);
      const productWithPrices = await productRepository2.findById(product.id, organizationId);
      res.status(201).json(productWithPrices);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const products = await productRepository2.findAll(req.user?.organizationId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const product = await productRepository2.findById(req.params.id, req.user?.organizationId);
      if (!product) {
        throw new AppError(404, "Product not found");
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const { costPrice, sellingPrice, ...productData } = req.body;
      const organizationId = req.user?.organizationId || null;
      const product = await productRepository2.update(req.params.id, productData, organizationId);
      const priceHistoryPromises = [];
      if (costPrice !== void 0 && costPrice !== null) {
        const latestCost = await price_history_repository_default.getLatestPrice(product.id, PriceType2.COST);
        if (!latestCost || Number(latestCost.value) !== costPrice) {
          priceHistoryPromises.push(
            price_history_repository_default.create({
              productId: product.id,
              type: PriceType2.COST,
              value: costPrice
            })
          );
        }
      }
      if (sellingPrice !== void 0 && sellingPrice !== null) {
        const latestSelling = await price_history_repository_default.getLatestPrice(
          product.id,
          PriceType2.SELLING
        );
        if (!latestSelling || Number(latestSelling.value) !== sellingPrice) {
          priceHistoryPromises.push(
            price_history_repository_default.create({
              productId: product.id,
              type: PriceType2.SELLING,
              value: sellingPrice
            })
          );
        }
      }
      await Promise.all(priceHistoryPromises);
      const productWithPrices = await productRepository2.findById(product.id, organizationId);
      res.json(productWithPrices);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      await productRepository2.delete(req.params.id, req.user?.organizationId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
  async uploadImages(req, res, next) {
    try {
      const productId = req.params.id;
      const files = req.files;
      if (!files || files.length === 0) {
        throw new AppError(400, "No files uploaded");
      }
      const product = await productRepository2.findById(productId, req.user?.organizationId);
      if (!product) {
        throw new AppError(404, "Product not found");
      }
      const protocol = req.protocol;
      const host = req.get("host");
      const newImageUrls = files.map(
        (file) => `${protocol}://${host}/uploads/products/${file.filename}`
      );
      const updatedProduct = await productRepository2.update(
        productId,
        {
          imageUrls: [...product.imageUrls || [], ...newImageUrls]
        },
        req.user?.organizationId
      );
      res.json({
        message: "Images uploaded successfully",
        imageUrls: newImageUrls,
        product: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteImage(req, res, next) {
    try {
      const { id: productId, imageUrl } = req.params;
      const product = await productRepository2.findById(productId, req.user?.organizationId);
      if (!product) {
        throw new AppError(404, "Product not found");
      }
      const updatedImageUrls = (product.imageUrls || []).filter((url) => url !== imageUrl);
      const filename = imageUrl.split("/").pop();
      if (filename) {
        const { deleteFile: deleteFile2 } = await Promise.resolve().then(() => (init_upload_middleware(), upload_middleware_exports));
        deleteFile2(filename);
      }
      const updatedProduct = await productRepository2.update(
        productId,
        {
          imageUrls: updatedImageUrls
        },
        req.user?.organizationId
      );
      res.json({
        message: "Image deleted successfully",
        product: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/product.routes.ts
init_upload_middleware();
var router3 = Router3();
var productController = new ProductController();
router3.use(authenticate);
router3.post(
  "/",
  authorize("ADMIN", "TRADER", "MANUFACTURER"),
  validate(createProductSchema),
  productController.create.bind(productController)
);
router3.get("/", productController.getAll.bind(productController));
router3.get("/:id", productController.getById.bind(productController));
router3.put(
  "/:id",
  authorize("ADMIN", "TRADER", "MANUFACTURER"),
  validate(updateProductSchema),
  productController.update.bind(productController)
);
router3.post(
  "/:id/images",
  authorize("ADMIN", "TRADER", "MANUFACTURER"),
  upload.array("images", 5),
  // Max 5 images at once
  productController.uploadImages.bind(productController)
);
router3.delete(
  "/:id/images/:imageUrl",
  authorize("ADMIN", "TRADER", "MANUFACTURER"),
  productController.deleteImage.bind(productController)
);
router3.delete("/:id", authorize("ADMIN"), productController.delete.bind(productController));
var product_routes_default = router3;

// src/routes/provider.routes.ts
import { Router as Router4 } from "express";

// src/controllers/provider.controller.ts
import { PrismaClient as PrismaClient6 } from "@prisma/client";
var prisma6 = new PrismaClient6();
var ProviderController = class {
  async create(req, res, next) {
    try {
      const provider = await prisma6.provider.create({
        data: {
          ...req.body,
          organizationId: req.user?.organizationId
        }
      });
      res.status(201).json(provider);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const providers = await prisma6.provider.findMany({
        where: {
          organizationId: req.user?.organizationId
        },
        include: {
          products: true
        }
      });
      res.json(providers);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const provider = await prisma6.provider.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user?.organizationId
        },
        include: {
          products: true
        }
      });
      if (!provider) {
        throw new AppError(404, "Provider not found");
      }
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const organizationId = req.user?.organizationId;
      const provider = await prisma6.provider.update({
        where: {
          id: req.params.id,
          organizationId
        },
        data: req.body
      });
      res.json(provider);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      const organizationId = req.user?.organizationId;
      await prisma6.provider.delete({
        where: {
          id: req.params.id,
          organizationId
        }
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/provider.routes.ts
var router4 = Router4();
var providerController = new ProviderController();
router4.use(authenticate);
router4.post(
  "/",
  authorize("ADMIN", "TRADER"),
  validate(createProviderSchema),
  providerController.create.bind(providerController)
);
router4.get("/", providerController.getAll.bind(providerController));
router4.get("/:id", providerController.getById.bind(providerController));
router4.put(
  "/:id",
  authorize("ADMIN", "TRADER"),
  validate(updateProviderSchema),
  providerController.update.bind(providerController)
);
router4.delete("/:id", authorize("ADMIN"), providerController.delete.bind(providerController));
var provider_routes_default = router4;

// src/routes/client.routes.ts
import { Router as Router5 } from "express";

// src/controllers/client.controller.ts
import { PrismaClient as PrismaClient7 } from "@prisma/client";
var prisma7 = new PrismaClient7();
var ClientController = class {
  async create(req, res, next) {
    try {
      const client2 = await prisma7.client.create({
        data: {
          ...req.body,
          organizationId: req.user?.organizationId
        }
      });
      res.status(201).json(client2);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const clients = await prisma7.client.findMany({
        where: req.user?.organizationId ? { organizationId: req.user.organizationId } : void 0,
        include: {
          budgets: {
            orderBy: { createdAt: "desc" },
            take: 5
          }
        }
      });
      res.json(clients);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const client2 = await prisma7.client.findFirst({
        where: {
          id: req.params.id,
          ...req.user?.organizationId ? { organizationId: req.user.organizationId } : {}
        },
        include: {
          budgets: {
            orderBy: { createdAt: "desc" }
          }
        }
      });
      if (!client2) {
        throw new AppError(404, "Client not found");
      }
      res.json(client2);
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma7.client.findFirst({
          where: { id: req.params.id, organizationId }
        });
        if (!existing) {
          throw new AppError(404, "Client not found");
        }
      }
      const client2 = await prisma7.client.update({
        where: { id: req.params.id },
        data: req.body
      });
      res.json(client2);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma7.client.findFirst({
          where: { id: req.params.id, organizationId }
        });
        if (!existing) {
          throw new AppError(404, "Client not found");
        }
      }
      await prisma7.client.delete({
        where: { id: req.params.id }
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/client.routes.ts
var router5 = Router5();
var clientController = new ClientController();
router5.use(authenticate);
router5.post(
  "/",
  authorize("ADMIN", "TRADER"),
  validate(createClientSchema),
  clientController.create.bind(clientController)
);
router5.get("/", clientController.getAll.bind(clientController));
router5.get("/:id", clientController.getById.bind(clientController));
router5.put(
  "/:id",
  authorize("ADMIN", "TRADER"),
  validate(updateClientSchema),
  clientController.update.bind(clientController)
);
router5.delete("/:id", authorize("ADMIN"), clientController.delete.bind(clientController));
var client_routes_default = router5;

// src/routes/cost.routes.ts
import { Router as Router6 } from "express";

// src/controllers/cost.controller.ts
import { PrismaClient as PrismaClient8 } from "@prisma/client";
var prisma8 = new PrismaClient8();
var CostController = class {
  async create(req, res, next) {
    try {
      const cost = await prisma8.cost.create({
        data: {
          ...req.body,
          value: toPrismaDecimal(req.body.value),
          organizationId: req.user?.organizationId
        }
      });
      res.status(201).json(cost);
    } catch (error) {
      next(error);
    }
  }
  async getAll(req, res, next) {
    try {
      const costs = await prisma8.cost.findMany({
        where: req.user?.organizationId ? { organizationId: req.user.organizationId } : void 0,
        orderBy: { createdAt: "desc" }
      });
      res.json(costs);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const cost = await prisma8.cost.findFirst({
        where: {
          id: req.params.id,
          ...req.user?.organizationId ? { organizationId: req.user.organizationId } : {}
        }
      });
      if (!cost) {
        throw new AppError(404, "Cost not found");
      }
      res.json(cost);
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma8.cost.findFirst({
          where: { id: req.params.id, organizationId }
        });
        if (!existing) {
          throw new AppError(404, "Cost not found");
        }
      }
      const cost = await prisma8.cost.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          value: req.body.value ? toPrismaDecimal(req.body.value) : void 0
        }
      });
      res.json(cost);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      const organizationId = req.user?.organizationId;
      if (organizationId) {
        const existing = await prisma8.cost.findFirst({
          where: { id: req.params.id, organizationId }
        });
        if (!existing) {
          throw new AppError(404, "Cost not found");
        }
      }
      await prisma8.cost.delete({
        where: { id: req.params.id }
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/cost.routes.ts
var router6 = Router6();
var costController = new CostController();
router6.use(authenticate);
router6.post(
  "/",
  authorize("ADMIN", "TRADER"),
  validate(createCostSchema),
  costController.create.bind(costController)
);
router6.get("/", costController.getAll.bind(costController));
router6.get("/:id", costController.getById.bind(costController));
router6.put("/:id", authorize("ADMIN", "TRADER"), costController.update.bind(costController));
router6.delete("/:id", authorize("ADMIN"), costController.delete.bind(costController));
var cost_routes_default = router6;

// src/routes/tariff-position.routes.ts
import { Router as Router7 } from "express";
import { Role as Role3 } from "@prisma/client";

// src/repositories/tariff-position.repository.ts
import { PrismaClient as PrismaClient9 } from "@prisma/client";
var prisma9 = new PrismaClient9();
var TariffPositionRepository = class {
  /**
   * Find all tariff positions with pagination
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [tariffPositions, total] = await Promise.all([
      prisma9.tariffPosition.findMany({
        skip,
        take: limit,
        orderBy: { code: "asc" },
        include: {
          _count: {
            select: { products: true }
          }
        }
      }),
      prisma9.tariffPosition.count()
    ]);
    return {
      data: tariffPositions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  /**
   * Find tariff position by ID
   */
  async findById(id) {
    return prisma9.tariffPosition.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Find tariff position by code
   */
  async findByCode(code) {
    return prisma9.tariffPosition.findUnique({
      where: { code }
    });
  }
  /**
   * Create new tariff position
   */
  async create(data) {
    return prisma9.tariffPosition.create({
      data
    });
  }
  /**
   * Update tariff position
   */
  async update(id, data) {
    return prisma9.tariffPosition.update({
      where: { id },
      data
    });
  }
  /**
   * Delete tariff position
   */
  async delete(id) {
    return prisma9.tariffPosition.delete({
      where: { id }
    });
  }
  /**
   * Search tariff positions by code or description
   */
  async search(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [tariffPositions, total] = await Promise.all([
      prisma9.tariffPosition.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        },
        skip,
        take: limit,
        orderBy: { code: "asc" }
      }),
      prisma9.tariffPosition.count({
        where: {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        }
      })
    ]);
    return {
      data: tariffPositions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};
var tariff_position_repository_default = new TariffPositionRepository();

// src/services/tariff-position.service.ts
var TariffPositionService = class {
  /**
   * Get all tariff positions with pagination
   */
  async getAllTariffPositions(page = 1, limit = 20) {
    return tariff_position_repository_default.findAll(page, limit);
  }
  /**
   * Get tariff position by ID
   */
  async getTariffPositionById(id) {
    const tariffPosition = await tariff_position_repository_default.findById(id);
    if (!tariffPosition) {
      throw new Error("Tariff position not found");
    }
    return tariffPosition;
  }
  /**
   * Create new tariff position
   */
  async createTariffPosition(data) {
    const existing = await tariff_position_repository_default.findByCode(data.code);
    if (existing) {
      throw new Error(`Tariff position with code ${data.code} already exists`);
    }
    return tariff_position_repository_default.create(data);
  }
  /**
   * Update tariff position
   */
  async updateTariffPosition(id, data) {
    await this.getTariffPositionById(id);
    if (data.code) {
      const existing = await tariff_position_repository_default.findByCode(data.code);
      if (existing && existing.id !== id) {
        throw new Error(`Tariff position with code ${data.code} already exists`);
      }
    }
    return tariff_position_repository_default.update(id, data);
  }
  /**
   * Delete tariff position
   */
  async deleteTariffPosition(id) {
    const tariffPosition = await this.getTariffPositionById(id);
    if (tariffPosition.products && tariffPosition.products.length > 0) {
      throw new Error("Cannot delete tariff position that is being used by products");
    }
    return tariff_position_repository_default.delete(id);
  }
  /**
   * Search tariff positions
   */
  async searchTariffPositions(query, page = 1, limit = 20) {
    return tariff_position_repository_default.search(query, page, limit);
  }
};
var tariff_position_service_default = new TariffPositionService();

// src/schemas/tariff-position.schema.ts
import { z as z2 } from "zod";
var createTariffPositionSchema = z2.object({
  code: z2.string().min(4, "Tariff code must be at least 4 characters").max(20, "Tariff code must not exceed 20 characters").regex(/^[0-9.]+$/, "Tariff code must contain only numbers and dots").refine((val) => !val.startsWith(".") && !val.endsWith("."), {
    message: "Tariff code cannot start or end with a dot"
  }).refine((val) => !val.includes(".."), {
    message: "Tariff code cannot contain consecutive dots"
  }),
  description: z2.string().min(3, "Description must be at least 3 characters").max(500, "Description must not exceed 500 characters"),
  dutyRate: z2.number().min(0, "Duty rate cannot be negative").max(100, "Duty rate cannot exceed 100%").optional()
});
var updateTariffPositionSchema = createTariffPositionSchema.partial();
var tariffPositionIdSchema = z2.object({
  id: z2.string().cuid("Invalid tariff position ID format")
});

// src/controllers/tariff-position.controller.ts
var TariffPositionController = class {
  /**
   * @route GET /api/tariff-positions
   * @summary Get all tariff positions
   * @returns {TariffPosition[]} 200 - List of tariff positions with pagination
   */
  async getAllTariffPositions(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      let result;
      if (search) {
        result = await tariff_position_service_default.searchTariffPositions(search, page, limit);
      } else {
        result = await tariff_position_service_default.getAllTariffPositions(page, limit);
      }
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/tariff-positions/:id
   * @summary Get tariff position by ID
   * @returns {TariffPosition} 200 - Tariff position details
   */
  async getTariffPositionById(req, res, next) {
    try {
      const { id } = tariffPositionIdSchema.parse(req.params);
      const tariffPosition = await tariff_position_service_default.getTariffPositionById(id);
      res.json({
        success: true,
        data: tariffPosition
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/tariff-positions
   * @summary Create new tariff position
   * @returns {TariffPosition} 201 - Created tariff position
   */
  async createTariffPosition(req, res, next) {
    try {
      const data = createTariffPositionSchema.parse(req.body);
      const tariffPosition = await tariff_position_service_default.createTariffPosition(data);
      res.status(201).json({
        success: true,
        data: tariffPosition
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/tariff-positions/:id
   * @summary Update tariff position
   * @returns {TariffPosition} 200 - Updated tariff position
   */
  async updateTariffPosition(req, res, next) {
    try {
      const { id } = tariffPositionIdSchema.parse(req.params);
      const data = updateTariffPositionSchema.parse(req.body);
      const tariffPosition = await tariff_position_service_default.updateTariffPosition(id, data);
      res.json({
        success: true,
        data: tariffPosition
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/tariff-positions/:id
   * @summary Delete tariff position
   * @returns {Object} 200 - Success message
   */
  async deleteTariffPosition(req, res, next) {
    try {
      const { id } = tariffPositionIdSchema.parse(req.params);
      await tariff_position_service_default.deleteTariffPosition(id);
      res.json({
        success: true,
        message: "Tariff position deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var tariff_position_controller_default = new TariffPositionController();

// src/routes/tariff-position.routes.ts
var router7 = Router7();
router7.get(
  "/",
  authenticate,
  tariff_position_controller_default.getAllTariffPositions.bind(tariff_position_controller_default)
);
router7.get(
  "/:id",
  authenticate,
  tariff_position_controller_default.getTariffPositionById.bind(tariff_position_controller_default)
);
router7.post(
  "/",
  authenticate,
  authorize(Role3.ADMIN, Role3.MANUFACTURER),
  tariff_position_controller_default.createTariffPosition.bind(tariff_position_controller_default)
);
router7.put(
  "/:id",
  authenticate,
  authorize(Role3.ADMIN, Role3.MANUFACTURER),
  tariff_position_controller_default.updateTariffPosition.bind(tariff_position_controller_default)
);
router7.delete(
  "/:id",
  authenticate,
  authorize(Role3.ADMIN),
  tariff_position_controller_default.deleteTariffPosition.bind(tariff_position_controller_default)
);
var tariff_position_routes_default = router7;

// src/routes/unit-of-measure.routes.ts
import { Router as Router8 } from "express";
import { Role as Role4 } from "@prisma/client";

// src/repositories/unit-of-measure.repository.ts
import { PrismaClient as PrismaClient10 } from "@prisma/client";
var prisma10 = new PrismaClient10();
var UnitOfMeasureRepository = class {
  /**
   * Find all units of measure
   */
  async findAll() {
    return prisma10.unitOfMeasure.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
  }
  /**
   * Find unit by ID
   */
  async findById(id) {
    return prisma10.unitOfMeasure.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Find unit by abbreviation
   */
  async findByAbbreviation(abbreviation) {
    return prisma10.unitOfMeasure.findUnique({
      where: { abbreviation }
    });
  }
  /**
   * Create new unit of measure
   */
  async create(data) {
    return prisma10.unitOfMeasure.create({
      data
    });
  }
  /**
   * Update unit of measure
   */
  async update(id, data) {
    return prisma10.unitOfMeasure.update({
      where: { id },
      data
    });
  }
  /**
   * Delete unit of measure
   */
  async delete(id) {
    return prisma10.unitOfMeasure.delete({
      where: { id }
    });
  }
};
var unit_of_measure_repository_default = new UnitOfMeasureRepository();

// src/services/unit-of-measure.service.ts
var UnitOfMeasureService = class {
  /**
   * Get all units of measure
   */
  async getAllUnits() {
    return unit_of_measure_repository_default.findAll();
  }
  /**
   * Get unit by ID
   */
  async getUnitById(id) {
    const unit = await unit_of_measure_repository_default.findById(id);
    if (!unit) {
      throw new Error("Unit of measure not found");
    }
    return unit;
  }
  /**
   * Create new unit of measure
   */
  async createUnit(data) {
    const existing = await unit_of_measure_repository_default.findByAbbreviation(data.abbreviation);
    if (existing) {
      throw new Error(`Unit with abbreviation ${data.abbreviation} already exists`);
    }
    return unit_of_measure_repository_default.create(data);
  }
  /**
   * Update unit of measure
   */
  async updateUnit(id, data) {
    await this.getUnitById(id);
    if (data.abbreviation) {
      const existing = await unit_of_measure_repository_default.findByAbbreviation(data.abbreviation);
      if (existing && existing.id !== id) {
        throw new Error(`Unit with abbreviation ${data.abbreviation} already exists`);
      }
    }
    return unit_of_measure_repository_default.update(id, data);
  }
  /**
   * Delete unit of measure
   */
  async deleteUnit(id) {
    const unit = await this.getUnitById(id);
    if (unit.products && unit.products.length > 0) {
      throw new Error("Cannot delete unit that is being used by products");
    }
    return unit_of_measure_repository_default.delete(id);
  }
};
var unit_of_measure_service_default = new UnitOfMeasureService();

// src/schemas/unit-of-measure.schema.ts
import { z as z3 } from "zod";
var createUnitSchema = z3.object({
  name: z3.string().min(2, "Unit name must be at least 2 characters").max(50, "Unit name must not exceed 50 characters"),
  abbreviation: z3.string().min(1, "Abbreviation must be at least 1 character").max(10, "Abbreviation must not exceed 10 characters").regex(/^[a-zA-Z0-9³²]+$/, "Abbreviation must contain only letters, numbers, and superscripts")
});
var updateUnitSchema = createUnitSchema.partial();
var unitIdSchema = z3.object({
  id: z3.string().cuid("Invalid unit ID format")
});

// src/controllers/unit-of-measure.controller.ts
var UnitOfMeasureController = class {
  /**
   * @route GET /api/units
   * @summary Get all units of measure
   * @returns {UnitOfMeasure[]} 200 - List of units
   */
  async getAllUnits(_req, res, next) {
    try {
      const units = await unit_of_measure_service_default.getAllUnits();
      res.json({
        success: true,
        data: units
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/units/:id
   * @summary Get unit by ID
   * @returns {UnitOfMeasure} 200 - Unit details
   */
  async getUnitById(req, res, next) {
    try {
      const { id } = unitIdSchema.parse(req.params);
      const unit = await unit_of_measure_service_default.getUnitById(id);
      res.json({
        success: true,
        data: unit
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/units
   * @summary Create new unit of measure
   * @returns {UnitOfMeasure} 201 - Created unit
   */
  async createUnit(req, res, next) {
    try {
      const data = createUnitSchema.parse(req.body);
      const unit = await unit_of_measure_service_default.createUnit(data);
      res.status(201).json({
        success: true,
        data: unit
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/units/:id
   * @summary Update unit of measure
   * @returns {UnitOfMeasure} 200 - Updated unit
   */
  async updateUnit(req, res, next) {
    try {
      const { id } = unitIdSchema.parse(req.params);
      const data = updateUnitSchema.parse(req.body);
      const unit = await unit_of_measure_service_default.updateUnit(id, data);
      res.json({
        success: true,
        data: unit
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/units/:id
   * @summary Delete unit of measure
   * @returns {Object} 200 - Success message
   */
  async deleteUnit(req, res, next) {
    try {
      const { id } = unitIdSchema.parse(req.params);
      await unit_of_measure_service_default.deleteUnit(id);
      res.json({
        success: true,
        message: "Unit of measure deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var unit_of_measure_controller_default = new UnitOfMeasureController();

// src/routes/unit-of-measure.routes.ts
var router8 = Router8();
router8.get("/", authenticate, unit_of_measure_controller_default.getAllUnits.bind(unit_of_measure_controller_default));
router8.get("/:id", authenticate, unit_of_measure_controller_default.getUnitById.bind(unit_of_measure_controller_default));
router8.post(
  "/",
  authenticate,
  authorize(Role4.ADMIN),
  unit_of_measure_controller_default.createUnit.bind(unit_of_measure_controller_default)
);
router8.put(
  "/:id",
  authenticate,
  authorize(Role4.ADMIN),
  unit_of_measure_controller_default.updateUnit.bind(unit_of_measure_controller_default)
);
router8.delete(
  "/:id",
  authenticate,
  authorize(Role4.ADMIN),
  unit_of_measure_controller_default.deleteUnit.bind(unit_of_measure_controller_default)
);
var unit_of_measure_routes_default = router8;

// src/routes/country.routes.ts
import { Router as Router9 } from "express";
import { Role as Role5 } from "@prisma/client";

// src/repositories/country.repository.ts
import { PrismaClient as PrismaClient11 } from "@prisma/client";
var prisma11 = new PrismaClient11();
var CountryRepository = class {
  /**
   * Find all countries
   */
  async findAll() {
    return prisma11.country.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { exportTasks: true }
        }
      }
    });
  }
  /**
   * Find country by ID
   */
  async findById(id) {
    return prisma11.country.findUnique({
      where: { id },
      include: {
        exportTasks: {
          select: {
            id: true,
            description: true,
            status: true,
            dueDate: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }
  /**
   * Find country by code
   */
  async findByCode(code) {
    return prisma11.country.findUnique({
      where: { code }
    });
  }
  /**
   * Create new country
   */
  async create(data) {
    return prisma11.country.create({
      data
    });
  }
  /**
   * Update country
   */
  async update(id, data) {
    return prisma11.country.update({
      where: { id },
      data
    });
  }
  /**
   * Delete country
   */
  async delete(id) {
    return prisma11.country.delete({
      where: { id }
    });
  }
};
var country_repository_default = new CountryRepository();

// src/services/country.service.ts
var CountryService = class {
  /**
   * Get all countries
   */
  async getAllCountries() {
    return country_repository_default.findAll();
  }
  /**
   * Get country by ID
   */
  async getCountryById(id) {
    const country = await country_repository_default.findById(id);
    if (!country) {
      throw new Error("Country not found");
    }
    return country;
  }
  /**
   * Create new country
   */
  async createCountry(data) {
    const normalizedData = {
      ...data,
      code: data.code.toUpperCase()
    };
    const existing = await country_repository_default.findByCode(normalizedData.code);
    if (existing) {
      throw new Error(`Country with code ${normalizedData.code} already exists`);
    }
    return country_repository_default.create(normalizedData);
  }
  /**
   * Update country
   */
  async updateCountry(id, data) {
    await this.getCountryById(id);
    const normalizedData = data.code ? { ...data, code: data.code.toUpperCase() } : data;
    if (normalizedData.code) {
      const existing = await country_repository_default.findByCode(normalizedData.code);
      if (existing && existing.id !== id) {
        throw new Error(`Country with code ${normalizedData.code} already exists`);
      }
    }
    return country_repository_default.update(id, normalizedData);
  }
  /**
   * Delete country
   */
  async deleteCountry(id) {
    const country = await this.getCountryById(id);
    if (country.exportTasks && country.exportTasks.length > 0) {
      throw new Error("Cannot delete country that has export tasks");
    }
    return country_repository_default.delete(id);
  }
};
var country_service_default = new CountryService();

// src/schemas/country.schema.ts
import { z as z4 } from "zod";
var createCountrySchema = z4.object({
  name: z4.string().min(2, "Country name must be at least 2 characters").max(100, "Country name must not exceed 100 characters"),
  code: z4.string().length(2, "Country code must be exactly 2 characters (ISO 3166-1 alpha-2)").regex(/^[A-Z]{2}$/, "Country code must be uppercase letters (e.g., AR, US, BR)").or(
    z4.string().length(3, "Country code must be 2 or 3 characters (ISO 3166-1)").regex(/^[A-Z]{3}$/, "Country code must be uppercase letters")
  )
});
var updateCountrySchema = createCountrySchema.partial();
var countryIdSchema = z4.object({
  id: z4.string().cuid("Invalid country ID format")
});

// src/controllers/country.controller.ts
var CountryController = class {
  /**
   * @route GET /api/countries
   * @summary Get all countries
   * @returns {Country[]} 200 - List of countries
   */
  async getAll(_req, res, next) {
    try {
      const countries = await country_service_default.getAllCountries();
      res.json({
        success: true,
        data: countries
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/countries/:id
   * @summary Get country by ID
   * @returns {Country} 200 - Country details
   */
  async getById(req, res, next) {
    try {
      const { id } = countryIdSchema.parse(req.params);
      const country = await country_service_default.getCountryById(id);
      res.json({
        success: true,
        data: country
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/countries
   * @summary Create new country
   * @returns {Country} 201 - Created country
   */
  async create(req, res, next) {
    try {
      const data = createCountrySchema.parse(req.body);
      const country = await country_service_default.createCountry(data);
      res.status(201).json({
        success: true,
        data: country
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/countries/:id
   * @summary Update country
   * @returns {Country} 200 - Updated country
   */
  async update(req, res, next) {
    try {
      const { id } = countryIdSchema.parse(req.params);
      const data = updateCountrySchema.parse(req.body);
      const country = await country_service_default.updateCountry(id, data);
      res.json({
        success: true,
        data: country
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/countries/:id
   * @summary Delete country
   * @returns {Object} 200 - Success message
   */
  async delete(req, res, next) {
    try {
      const { id } = countryIdSchema.parse(req.params);
      await country_service_default.deleteCountry(id);
      res.json({
        success: true,
        message: "Country deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var country_controller_default = new CountryController();

// src/routes/country.routes.ts
var router9 = Router9();
router9.get("/", authenticate, country_controller_default.getAll.bind(country_controller_default));
router9.get("/:id", authenticate, country_controller_default.getById.bind(country_controller_default));
router9.post(
  "/",
  authenticate,
  authorize(Role5.ADMIN),
  country_controller_default.create.bind(country_controller_default)
);
router9.put(
  "/:id",
  authenticate,
  authorize(Role5.ADMIN),
  country_controller_default.update.bind(country_controller_default)
);
router9.delete(
  "/:id",
  authenticate,
  authorize(Role5.ADMIN),
  country_controller_default.delete.bind(country_controller_default)
);
var country_routes_default = router9;

// src/routes/export-task.routes.ts
import { Router as Router10 } from "express";
import { Role as Role6 } from "@prisma/client";

// src/repositories/export-task.repository.ts
import { PrismaClient as PrismaClient12 } from "@prisma/client";
var prisma12 = new PrismaClient12();
var ExportTaskRepository = class {
  /**
   * Find all export tasks with optional filters
   */
  async findAll(filters) {
    const { status, countryId, page = 1, limit = 20, organizationId } = filters || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (countryId) where.countryId = countryId;
    if (organizationId) where.organizationId = organizationId;
    const [exportTasks, total] = await Promise.all([
      prisma12.exportTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          country: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          products: {
            select: {
              id: true,
              sku: true,
              title: true
            }
          }
        }
      }),
      prisma12.exportTask.count({ where })
    ]);
    return {
      data: exportTasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  /**
   * Find export task by ID
   */
  async findById(id, organizationId) {
    return prisma12.exportTask.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        country: true,
        products: {
          include: {
            tariffPosition: true,
            unit: true
          }
        }
      }
    });
  }
  /**
   * Create new export task
   */
  async create(data) {
    const { productIds, ...taskData } = data;
    return prisma12.exportTask.create({
      data: {
        ...taskData,
        products: productIds ? {
          connect: productIds.map((id) => ({ id }))
        } : void 0
      },
      include: {
        country: true,
        products: true
      }
    });
  }
  /**
   * Update export task
   */
  async update(id, data, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    const { productIds, ...updateData } = data;
    return prisma12.exportTask.update({
      where: { id },
      data: {
        ...updateData,
        products: productIds ? {
          set: productIds.map((id2) => ({ id: id2 }))
        } : void 0
      },
      include: {
        country: true,
        products: true
      }
    });
  }
  /**
   * Update task status
   */
  async updateStatus(id, status, completedAt, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma12.exportTask.update({
      where: { id },
      data: {
        status,
        completedAt: status === "COMPLETED" ? completedAt || /* @__PURE__ */ new Date() : null
      }
    });
  }
  /**
   * Delete export task
   */
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma12.exportTask.delete({
      where: { id }
    });
  }
  /**
   * Find tasks by country
   */
  async findByCountry(countryId) {
    return prisma12.exportTask.findMany({
      where: { countryId },
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Find tasks by status
   */
  async findByStatus(status) {
    return prisma12.exportTask.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      include: {
        products: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
};
var export_task_repository_default = new ExportTaskRepository();

// src/services/export-task.service.ts
var ExportTaskService = class {
  /**
   * Get all export tasks with filters
   */
  async getAllExportTasks(filters) {
    return export_task_repository_default.findAll(filters);
  }
  /**
   * Get export task by ID
   */
  async getExportTaskById(id, organizationId) {
    const exportTask = await export_task_repository_default.findById(id, organizationId);
    if (!exportTask) {
      throw new Error("Export task not found");
    }
    return exportTask;
  }
  /**
   * Create new export task
   */
  async createExportTask(data) {
    const country = await country_repository_default.findById(data.countryId);
    if (!country) {
      throw new Error("Country not found");
    }
    const taskData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : void 0
    };
    return export_task_repository_default.create(taskData);
  }
  /**
   * Update export task
   */
  async updateExportTask(id, data, organizationId) {
    await this.getExportTaskById(id, organizationId);
    if (data.countryId) {
      const country = await country_repository_default.findById(data.countryId);
      if (!country) {
        throw new Error("Country not found");
      }
    }
    const taskData = { ...data };
    if (data.dueDate) {
      taskData.dueDate = new Date(data.dueDate);
    }
    return export_task_repository_default.update(id, taskData);
  }
  /**
   * Update task status
   */
  async updateTaskStatus(id, data, organizationId) {
    await this.getExportTaskById(id, organizationId);
    const completedAt = data.completedAt ? new Date(data.completedAt) : void 0;
    return export_task_repository_default.updateStatus(id, data.status, completedAt);
  }
  /**
   * Delete export task
   */
  async deleteExportTask(id, organizationId) {
    await this.getExportTaskById(id, organizationId);
    return export_task_repository_default.delete(id);
  }
  /**
   * Get tasks by country
   */
  async getTasksByCountry(countryId) {
    const country = await country_repository_default.findById(countryId);
    if (!country) {
      throw new Error("Country not found");
    }
    return export_task_repository_default.findByCountry(countryId);
  }
  /**
   * Get tasks by status
   */
  async getTasksByStatus(status) {
    return export_task_repository_default.findByStatus(status);
  }
};
var export_task_service_default = new ExportTaskService();

// src/schemas/export-task.schema.ts
import { z as z5 } from "zod";
var taskStatusSchema = z5.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
var createExportTaskSchema2 = z5.object({
  description: z5.string().min(5, "Description must be at least 5 characters").max(1e3, "Description must not exceed 1000 characters"),
  countryId: z5.string().cuid("Invalid country ID format"),
  productIds: z5.array(z5.string().cuid("Invalid product ID format")).min(1, "At least one product must be selected").optional(),
  dueDate: z5.string().datetime("Invalid date format").or(z5.date()).optional(),
  status: taskStatusSchema.optional().default("PENDING")
});
var updateExportTaskSchema2 = createExportTaskSchema2.partial();
var updateTaskStatusSchema = z5.object({
  status: taskStatusSchema,
  completedAt: z5.string().datetime("Invalid date format").or(z5.date()).optional()
});
var exportTaskIdSchema = z5.object({
  id: z5.string().cuid("Invalid export task ID format")
});

// src/controllers/export-task.controller.ts
var ExportTaskController = class {
  /**
   * @route GET /api/export-tasks
   * @summary Get all export tasks
   * @returns {ExportTask[]} 200 - List of export tasks with pagination
   */
  async getAll(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const countryId = req.query.countryId;
      const status = req.query.status ? taskStatusSchema.parse(req.query.status) : void 0;
      const result = await export_task_service_default.getAllExportTasks({
        countryId,
        status,
        page,
        limit,
        organizationId: req.user?.organizationId
      });
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/export-tasks/:id
   * @summary Get export task by ID
   * @returns {ExportTask} 200 - Export task details
   */
  async getById(req, res, next) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      const exportTask = await export_task_service_default.getExportTaskById(id, req.user?.organizationId);
      res.json({
        success: true,
        data: exportTask
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/export-tasks
   * @summary Create new export task
   * @returns {ExportTask} 201 - Created export task
   */
  async create(req, res, next) {
    try {
      const data = createExportTaskSchema2.parse(req.body);
      const task = await export_task_service_default.createExportTask({
        ...data,
        organizationId: req.user?.organizationId
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/export-tasks/:id
   * @summary Update export task
   * @returns {ExportTask} 200 - Updated export task
   */
  async update(req, res, next) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      const data = updateExportTaskSchema2.parse(req.body);
      const task = await export_task_service_default.updateExportTask(id, data, req.user?.organizationId);
      if (!task) {
        throw new AppError(404, "Export task not found");
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PATCH /api/export-tasks/:id/status
   * @summary Update export task status
   * @returns {ExportTask} 200 - Updated export task
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      const data = updateTaskStatusSchema.parse(req.body);
      const task = await export_task_service_default.updateTaskStatus(id, data, req.user?.organizationId);
      if (!task) {
        throw new AppError(404, "Export task not found");
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/export-tasks/:id
   * @summary Delete export task
   * @returns {Object} 200 - Success message
   */
  async delete(req, res, next) {
    try {
      const { id } = exportTaskIdSchema.parse(req.params);
      await export_task_service_default.deleteExportTask(id, req.user?.organizationId);
      res.json({
        success: true,
        message: "Export task deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var export_task_controller_default = new ExportTaskController();

// src/routes/export-task.routes.ts
var router10 = Router10();
router10.get("/", authenticate, export_task_controller_default.getAll.bind(export_task_controller_default));
router10.get("/:id", authenticate, export_task_controller_default.getById.bind(export_task_controller_default));
router10.post(
  "/",
  authenticate,
  authorize(Role6.ADMIN, Role6.TRADER, Role6.MANUFACTURER),
  export_task_controller_default.create.bind(export_task_controller_default)
);
router10.put(
  "/:id",
  authenticate,
  authorize(Role6.ADMIN, Role6.TRADER, Role6.MANUFACTURER),
  export_task_controller_default.update.bind(export_task_controller_default)
);
router10.patch(
  "/:id/status",
  authenticate,
  authorize(Role6.ADMIN, Role6.TRADER, Role6.MANUFACTURER),
  export_task_controller_default.updateStatus.bind(export_task_controller_default)
);
router10.delete(
  "/:id",
  authenticate,
  authorize(Role6.ADMIN),
  export_task_controller_default.delete.bind(export_task_controller_default)
);
var export_task_routes_default = router10;

// src/routes/tax.routes.ts
import { Router as Router11 } from "express";
import { Role as Role7 } from "@prisma/client";

// src/repositories/tax.repository.ts
import { PrismaClient as PrismaClient13 } from "@prisma/client";
var prisma13 = new PrismaClient13();
var TaxRepository = class {
  /**
   * Find all taxes
   */
  async findAll(organizationId) {
    return prisma13.tax.findMany({
      where: organizationId ? { organizationId } : void 0,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Find tax by ID
   */
  async findById(id, organizationId) {
    return prisma13.tax.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        product: true
      }
    });
  }
  /**
   * Find taxes by product ID
   */
  async findByProductId(productId, organizationId) {
    return prisma13.tax.findMany({
      where: {
        productId,
        ...organizationId ? { organizationId } : {}
      },
      orderBy: { name: "asc" }
    });
  }
  /**
   * Create new tax
   */
  async create(data) {
    return prisma13.tax.create({
      data,
      include: {
        product: {
          select: {
            id: true,
            sku: true,
            title: true
          }
        }
      }
    });
  }
  /**
   * Update tax
   */
  async update(id, data, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma13.tax.update({
      where: { id },
      data,
      include: {
        product: true
      }
    });
  }
  /**
   * Delete tax
   */
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma13.tax.delete({
      where: { id }
    });
  }
  /**
   * Calculate total tax percentage for a product
   */
  async getTotalTaxPercentage(productId) {
    const taxes = await this.findByProductId(productId);
    return taxes.reduce((sum, tax) => sum + Number(tax.percentage), 0);
  }
};
var tax_repository_default = new TaxRepository();

// src/services/tax.service.ts
var productRepository3 = new ProductRepository();
var TaxService = class {
  /**
   * Get all taxes
   */
  async getAllTaxes(organizationId) {
    return tax_repository_default.findAll(organizationId);
  }
  /**
   * Get tax by ID
   */
  async getTaxById(id, organizationId) {
    const tax = await tax_repository_default.findById(id, organizationId);
    if (!tax) {
      throw new Error("Tax not found");
    }
    return tax;
  }
  /**
   * Get taxes by product ID
   */
  async getTaxesByProductId(productId, organizationId) {
    const product = await productRepository3.findById(productId, organizationId);
    if (!product) {
      throw new Error("Product not found");
    }
    return tax_repository_default.findByProductId(productId, organizationId);
  }
  /**
   * Create new tax
   */
  async createTax(data) {
    const product = await productRepository3.findById(data.productId, data.organizationId);
    if (!product) {
      throw new Error("Product not found");
    }
    return tax_repository_default.create(data);
  }
  /**
   * Update tax
   */
  async updateTax(id, data, organizationId) {
    await this.getTaxById(id, organizationId);
    return tax_repository_default.update(id, data, organizationId);
  }
  /**
   * Delete tax
   */
  async deleteTax(id, organizationId) {
    await this.getTaxById(id, organizationId);
    return tax_repository_default.delete(id, organizationId);
  }
  /**
   * Get total tax percentage for a product
   */
  async getTotalTaxPercentage(productId) {
    const product = await productRepository3.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return tax_repository_default.getTotalTaxPercentage(productId);
  }
};
var tax_service_default = new TaxService();

// src/schemas/tax.schema.ts
import { z as z6 } from "zod";
var createTaxSchema = z6.object({
  productId: z6.string().cuid("Invalid product ID format"),
  name: z6.string().min(2, "Tax name must be at least 2 characters").max(100, "Tax name must not exceed 100 characters"),
  percentage: z6.number().min(0, "Tax percentage cannot be negative").max(100, "Tax percentage cannot exceed 100%")
});
var updateTaxSchema = createTaxSchema.partial().omit({ productId: true });
var taxIdSchema = z6.object({
  id: z6.string().cuid("Invalid tax ID format")
});
var productIdParamSchema = z6.object({
  productId: z6.string().cuid("Invalid product ID format")
});

// src/controllers/tax.controller.ts
var TaxController = class {
  /**
   * @route GET /api/taxes
   * @summary Get all taxes
   * @returns {Tax[]} 200 - List of taxes
   */
  async getAllTaxes(req, res, next) {
    try {
      const taxes = await tax_service_default.getAllTaxes(req.user?.organizationId);
      res.json({
        success: true,
        data: taxes
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/taxes/product/:productId
   * @summary Get taxes for a product
   * @returns {Tax[]} 200 - List of taxes for the product
   */
  async getTaxesByProductId(req, res, next) {
    try {
      const { productId } = productIdParamSchema.parse(req.params);
      const taxes = await tax_service_default.getTaxesByProductId(
        productId,
        req.user?.organizationId
      );
      res.json({
        success: true,
        data: taxes
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/taxes/:id
   * @summary Get tax by ID
   * @returns {Tax} 200 - Tax details
   */
  async getTaxById(req, res, next) {
    try {
      const { id } = taxIdSchema.parse(req.params);
      const tax = await tax_service_default.getTaxById(id, req.user?.organizationId);
      res.json({
        success: true,
        data: tax
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/taxes
   * @summary Create new tax
   * @returns {Tax} 201 - Created tax
   */
  async createTax(req, res, next) {
    try {
      const data = createTaxSchema.parse(req.body);
      const tax = await tax_service_default.createTax({
        ...data,
        organizationId: req.user?.organizationId
      });
      res.status(201).json({
        success: true,
        data: tax
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/taxes/:id
   * @summary Update tax
   * @returns {Tax} 200 - Updated tax
   */
  async updateTax(req, res, next) {
    try {
      const { id } = taxIdSchema.parse(req.params);
      const data = updateTaxSchema.parse(req.body);
      const tax = await tax_service_default.updateTax(id, data, req.user?.organizationId);
      res.json({
        success: true,
        data: tax
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/taxes/:id
   * @summary Delete tax
   * @returns {Object} 200 - Success message
   */
  async deleteTax(req, res, next) {
    try {
      const { id } = taxIdSchema.parse(req.params);
      await tax_service_default.deleteTax(id, req.user?.organizationId);
      res.json({
        success: true,
        message: "Tax deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var tax_controller_default = new TaxController();

// src/routes/tax.routes.ts
var router11 = Router11();
router11.get("/", authenticate, tax_controller_default.getAllTaxes.bind(tax_controller_default));
router11.get(
  "/product/:productId",
  authenticate,
  tax_controller_default.getTaxesByProductId.bind(tax_controller_default)
);
router11.get("/:id", authenticate, tax_controller_default.getTaxById.bind(tax_controller_default));
router11.post(
  "/",
  authenticate,
  authorize(Role7.ADMIN, Role7.MANUFACTURER),
  tax_controller_default.createTax.bind(tax_controller_default)
);
router11.put(
  "/:id",
  authenticate,
  authorize(Role7.ADMIN, Role7.MANUFACTURER),
  tax_controller_default.updateTax.bind(tax_controller_default)
);
router11.delete(
  "/:id",
  authenticate,
  authorize(Role7.ADMIN, Role7.MANUFACTURER),
  tax_controller_default.deleteTax.bind(tax_controller_default)
);
var tax_routes_default = router11;

// src/routes/price-history.routes.ts
import { Router as Router12 } from "express";
import { Role as Role8 } from "@prisma/client";

// src/services/price-history.service.ts
var productRepository4 = new ProductRepository();
var PriceHistoryService = class {
  /**
   * Get price history by product ID
   */
  async getPriceHistoryByProductId(productId, type) {
    const product = await productRepository4.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return price_history_repository_default.findByProductId(productId, type);
  }
  /**
   * Get price history by ID
   */
  async getPriceHistoryById(id) {
    const priceHistory = await price_history_repository_default.findById(id);
    if (!priceHistory) {
      throw new Error("Price history entry not found");
    }
    return priceHistory;
  }
  /**
   * Create new price history entry
   */
  async createPriceHistory(data) {
    const product = await productRepository4.findById(data.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    const priceData = {
      ...data,
      date: data.date ? new Date(data.date) : /* @__PURE__ */ new Date()
    };
    return price_history_repository_default.create(priceData);
  }
  /**
   * Delete price history entry
   */
  async deletePriceHistory(id) {
    await this.getPriceHistoryById(id);
    return price_history_repository_default.delete(id);
  }
  /**
   * Get latest price for a product
   */
  async getLatestPrice(productId, type) {
    const product = await productRepository4.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return price_history_repository_default.getLatestPrice(productId, type);
  }
  /**
   * Get price history within date range
   */
  async getPriceHistoryByDateRange(productId, startDate, endDate, type) {
    const product = await productRepository4.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return price_history_repository_default.findByDateRange(productId, startDate, endDate, type);
  }
};
var price_history_service_default = new PriceHistoryService();

// src/schemas/price-history.schema.ts
import { z as z7 } from "zod";
var priceTypeSchema = z7.enum(["COST", "SELLING"]);
var createPriceHistorySchema = z7.object({
  productId: z7.string().cuid("Invalid product ID format"),
  type: priceTypeSchema,
  value: z7.number().positive("Price value must be positive").max(99999999999e-2, "Price value is too large"),
  date: z7.string().datetime("Invalid date format").or(z7.date()).optional()
});
var priceHistoryIdSchema = z7.object({
  id: z7.string().cuid("Invalid price history ID format")
});
var productIdParamSchema2 = z7.object({
  productId: z7.string().cuid("Invalid product ID format")
});

// src/controllers/price-history.controller.ts
var PriceHistoryController = class {
  /**
   * @route GET /api/price-history/product/:productId
   * @summary Get price history for a product
   * @returns {PriceHistory[]} 200 - List of price history entries
   */
  async getPriceHistoryByProductId(req, res, next) {
    try {
      const { productId } = productIdParamSchema2.parse(req.params);
      const type = req.query.type ? priceTypeSchema.parse(req.query.type) : void 0;
      const priceHistory = await price_history_service_default.getPriceHistoryByProductId(productId, type);
      res.json({
        success: true,
        data: priceHistory
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/price-history
   * @summary Create new price history entry
   * @returns {PriceHistory} 201 - Created price history entry
   */
  async createPriceHistory(req, res, next) {
    try {
      const data = createPriceHistorySchema.parse(req.body);
      const priceHistory = await price_history_service_default.createPriceHistory(data);
      res.status(201).json({
        success: true,
        data: priceHistory
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/price-history/:id
   * @summary Delete price history entry
   * @returns {Object} 200 - Success message
   */
  async deletePriceHistory(req, res, next) {
    try {
      const { id } = priceHistoryIdSchema.parse(req.params);
      await price_history_service_default.deletePriceHistory(id);
      res.json({
        success: true,
        message: "Price history entry deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var price_history_controller_default = new PriceHistoryController();

// src/routes/price-history.routes.ts
var router12 = Router12();
router12.get(
  "/product/:productId",
  authenticate,
  price_history_controller_default.getPriceHistoryByProductId.bind(price_history_controller_default)
);
router12.post(
  "/",
  authenticate,
  authorize(Role8.ADMIN, Role8.MANUFACTURER),
  price_history_controller_default.createPriceHistory.bind(price_history_controller_default)
);
router12.delete(
  "/:id",
  authenticate,
  authorize(Role8.ADMIN, Role8.MANUFACTURER),
  price_history_controller_default.deletePriceHistory.bind(price_history_controller_default)
);
var price_history_routes_default = router12;

// src/routes/invoice.routes.ts
import { Router as Router13 } from "express";
import { Role as Role9 } from "@prisma/client";

// src/repositories/invoice.repository.ts
import { PrismaClient as PrismaClient14 } from "@prisma/client";
var prisma14 = new PrismaClient14();
var InvoiceRepository = class {
  /**
   * Find all invoices with pagination and filters
   */
  async findAll(filters) {
    const { budgetId, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (budgetId) where.budgetId = budgetId;
    if (filters?.organizationId) where.organizationId = filters.organizationId;
    const [invoices, total] = await Promise.all([
      prisma14.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          budget: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma14.invoice.count({ where })
    ]);
    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  /**
   * Find invoice by ID
   */
  async findById(id, organizationId) {
    return prisma14.invoice.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        budget: {
          include: {
            client: true,
            budgetItems: {
              include: {
                product: {
                  include: {
                    tariffPosition: true,
                    unit: true
                  }
                }
              }
            },
            costs: true
          }
        }
      }
    });
  }
  /**
   * Find invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber) {
    return prisma14.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        budget: {
          include: {
            client: true
          }
        }
      }
    });
  }
  /**
   * Create new invoice
   */
  async create(data) {
    return prisma14.invoice.create({
      data: {
        ...data,
        issueDate: data.issueDate || /* @__PURE__ */ new Date()
      },
      include: {
        budget: {
          include: {
            client: true
          }
        }
      }
    });
  }
  /**
   * Update invoice
   */
  async update(id, data) {
    return prisma14.invoice.update({
      where: { id },
      data,
      include: {
        budget: {
          include: {
            client: true
          }
        }
      }
    });
  }
  /**
   * Update PDF URL
   */
  async updatePdfUrl(id, pdfUrl) {
    return prisma14.invoice.update({
      where: { id },
      data: { pdfUrl }
    });
  }
  /**
   * Delete invoice
   */
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma14.invoice.delete({
      where: { id }
    });
  }
  /**
   * Find invoices by budget ID
   */
  async findByBudgetId(budgetId) {
    return prisma14.invoice.findMany({
      where: { budgetId },
      orderBy: { createdAt: "desc" }
    });
  }
};
var invoice_repository_default = new InvoiceRepository();

// src/services/invoice.service.ts
var InvoiceService = class {
  /**
   * Get all invoices with filters
   */
  async getAllInvoices(filters) {
    return invoice_repository_default.findAll(filters);
  }
  /**
   * Get invoice by ID
   */
  async getInvoiceById(id, organizationId) {
    const invoice = await invoice_repository_default.findById(id, organizationId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    return invoice;
  }
  /**
   * Create new invoice from budget
   */
  async createInvoice(data) {
    const budget = await budget_repository_default.findById(data.budgetId, data.organizationId);
    if (!budget) {
      throw new Error("Budget not found");
    }
    if (budget.status !== "APPROVED") {
      throw new Error("Can only create invoices from approved budgets");
    }
    const existing = await invoice_repository_default.findByInvoiceNumber(data.invoiceNumber);
    if (existing) {
      throw new Error(`Invoice number ${data.invoiceNumber} already exists`);
    }
    const invoiceData = {
      ...data,
      issueDate: data.issueDate ? new Date(data.issueDate) : /* @__PURE__ */ new Date(),
      dueDate: data.dueDate ? new Date(data.dueDate) : void 0
    };
    const invoice = await invoice_repository_default.create(invoiceData);
    await budget_repository_default.update(data.budgetId, { status: "INVOICED" });
    return invoice;
  }
  /**
   * Update invoice
   */
  async updateInvoice(id, data, organizationId) {
    await this.getInvoiceById(id, organizationId);
    if (data.invoiceNumber) {
      const existing = await invoice_repository_default.findByInvoiceNumber(data.invoiceNumber);
      if (existing && existing.id !== id) {
        throw new Error(`Invoice number ${data.invoiceNumber} already exists`);
      }
    }
    const invoiceData = { ...data };
    if (data.issueDate) {
      invoiceData.issueDate = new Date(data.issueDate);
    }
    if (data.dueDate) {
      invoiceData.dueDate = new Date(data.dueDate);
    }
    return invoice_repository_default.update(id, invoiceData);
  }
  /**
   * Generate PDF for invoice
   */
  async generatePdf(id) {
    const invoice = await invoice_repository_default.findById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    const { pdfGeneratorService: pdfGeneratorService2 } = await Promise.resolve().then(() => (init_pdf_generator_service(), pdf_generator_service_exports));
    const pdfUrl = await pdfGeneratorService2.generateInvoice(invoice);
    await invoice_repository_default.updatePdfUrl(id, pdfUrl);
    return pdfUrl;
  }
  /**
   * Delete invoice
   */
  async deleteInvoice(id, organizationId) {
    const invoice = await this.getInvoiceById(id, organizationId);
    await budget_repository_default.update(invoice.budgetId, { status: "APPROVED" });
    return invoice_repository_default.delete(id);
  }
  /**
   * Get invoices by budget ID
   */
  async getInvoicesByBudgetId(budgetId) {
    const budget = await budget_repository_default.findById(budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }
    return invoice_repository_default.findByBudgetId(budgetId);
  }
};
var invoice_service_default = new InvoiceService();

// src/schemas/invoice.schema.ts
import { z as z8 } from "zod";
var createInvoiceSchema = z8.object({
  budgetId: z8.string().cuid("Invalid budget ID format"),
  invoiceNumber: z8.string().min(3, "Invoice number must be at least 3 characters").max(50, "Invoice number must not exceed 50 characters").regex(
    /^[A-Z0-9-]+$/,
    "Invoice number must contain only uppercase letters, numbers, and hyphens"
  ),
  totalAmount: z8.number().positive("Total amount must be positive").max(99999999999e-2, "Total amount is too large"),
  issueDate: z8.string().datetime("Invalid issue date format").or(z8.date()).optional(),
  dueDate: z8.string().datetime("Invalid due date format").or(z8.date()).optional(),
  pdfUrl: z8.string().url("Invalid PDF URL").optional()
});
var updateInvoiceSchema = createInvoiceSchema.partial().omit({ budgetId: true });
var invoiceIdSchema = z8.object({
  id: z8.string().cuid("Invalid invoice ID format")
});
var generatePdfSchema = z8.object({
  id: z8.string().cuid("Invalid invoice ID format")
});

// src/controllers/invoice.controller.ts
var InvoiceController = class {
  /**
   * @route GET /api/invoices
   * @summary Get all invoices
   * @returns {Invoice[]} 200 - List of invoices with pagination
   */
  async getAllInvoices(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const budgetId = req.query.budgetId;
      const result = await invoice_service_default.getAllInvoices({
        budgetId,
        page,
        limit,
        organizationId: req.user?.organizationId
      });
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/invoices/:id
   * @summary Get invoice by ID
   * @returns {Invoice} 200 - Invoice details
   */
  async getInvoiceById(req, res, next) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      const invoice = await invoice_service_default.getInvoiceById(id, req.user?.organizationId);
      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/invoices
   * @summary Create new invoice from budget
   * @returns {Invoice} 201 - Created invoice
   */
  async createInvoice(req, res, next) {
    try {
      const data = createInvoiceSchema.parse(req.body);
      const invoice = await invoice_service_default.createInvoice({
        ...data,
        organizationId: req.user?.organizationId
      });
      res.status(201).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/invoices/:id
   * @summary Update invoice
   * @returns {Invoice} 200 - Updated invoice
   */
  async updateInvoice(req, res, next) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      const data = updateInvoiceSchema.parse(req.body);
      const invoice = await invoice_service_default.updateInvoice(
        id,
        data,
        req.user?.organizationId
      );
      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/invoices/:id/generate-pdf
   * @summary Generate PDF for invoice
   * @returns {Object} 200 - PDF URL
   */
  async generatePdf(req, res, next) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      const pdfUrl = await invoice_service_default.generatePdf(id);
      res.json({
        success: true,
        data: { pdfUrl }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/invoices/:id
   * @summary Delete invoice
   * @returns {Object} 200 - Success message
   */
  async deleteInvoice(req, res, next) {
    try {
      const { id } = invoiceIdSchema.parse(req.params);
      await invoice_service_default.deleteInvoice(id, req.user?.organizationId);
      res.json({
        success: true,
        message: "Invoice deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var invoice_controller_default = new InvoiceController();

// src/routes/invoice.routes.ts
var router13 = Router13();
router13.get("/", authenticate, invoice_controller_default.getAllInvoices.bind(invoice_controller_default));
router13.get("/:id", authenticate, invoice_controller_default.getInvoiceById.bind(invoice_controller_default));
router13.post(
  "/",
  authenticate,
  authorize(Role9.ADMIN, Role9.TRADER, Role9.MANUFACTURER),
  invoice_controller_default.createInvoice.bind(invoice_controller_default)
);
router13.put(
  "/:id",
  authenticate,
  authorize(Role9.ADMIN, Role9.TRADER, Role9.MANUFACTURER),
  invoice_controller_default.updateInvoice.bind(invoice_controller_default)
);
router13.post(
  "/:id/generate-pdf",
  authenticate,
  authorize(Role9.ADMIN, Role9.TRADER, Role9.MANUFACTURER),
  invoice_controller_default.generatePdf.bind(invoice_controller_default)
);
router13.delete(
  "/:id",
  authenticate,
  authorize(Role9.ADMIN),
  invoice_controller_default.deleteInvoice.bind(invoice_controller_default)
);
var invoice_routes_default = router13;

// src/routes/packing-list.routes.ts
import { Router as Router14 } from "express";
import { Role as Role10 } from "@prisma/client";

// src/repositories/packing-list.repository.ts
import { PrismaClient as PrismaClient15 } from "@prisma/client";
var prisma15 = new PrismaClient15();
var PackingListRepository = class {
  /**
   * Find all packing lists with pagination and filters
   */
  async findAll(filters) {
    const { budgetId, page = 1, limit = 20, organizationId } = filters || {};
    const skip = (page - 1) * limit;
    const where = {};
    if (budgetId) where.budgetId = budgetId;
    if (organizationId) where.organizationId = organizationId;
    const [packingLists, total] = await Promise.all([
      prisma15.packingList.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          budget: {
            include: {
              client: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma15.packingList.count({ where })
    ]);
    return {
      data: packingLists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  /**
   * Find packing list by ID
   */
  async findById(id, organizationId) {
    return prisma15.packingList.findFirst({
      where: {
        id,
        ...organizationId ? { organizationId } : {}
      },
      include: {
        budget: {
          include: {
            client: true,
            budgetItems: {
              include: {
                product: {
                  include: {
                    tariffPosition: true,
                    unit: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }
  /**
   * Create new packing list
   */
  async create(data) {
    return prisma15.packingList.create({
      data,
      include: {
        budget: {
          include: {
            client: true
          }
        }
      }
    });
  }
  /**
   * Update packing list
   */
  async update(id, data, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma15.packingList.update({
      where: { id },
      data,
      include: {
        budget: {
          include: {
            client: true
          }
        }
      }
    });
  }
  /**
   * Update PDF URL
   */
  async updatePdfUrl(id, pdfUrl) {
    return prisma15.packingList.update({
      where: { id },
      data: { pdfUrl }
    });
  }
  /**
   * Delete packing list
   */
  async delete(id, organizationId) {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma15.packingList.delete({
      where: { id }
    });
  }
  /**
   * Find packing lists by budget ID
   */
  async findByBudgetId(budgetId) {
    return prisma15.packingList.findMany({
      where: { budgetId },
      orderBy: { createdAt: "desc" }
    });
  }
};
var packing_list_repository_default = new PackingListRepository();

// src/services/packing-list.service.ts
var PackingListService = class {
  /**
   * Get all packing lists with filters
   */
  async getAllPackingLists(filters) {
    return packing_list_repository_default.findAll(filters);
  }
  /**
   * Get packing list by ID
   */
  async getPackingListById(id, organizationId) {
    const packingList = await packing_list_repository_default.findById(id, organizationId);
    if (!packingList) {
      throw new Error("Packing list not found");
    }
    return packingList;
  }
  /**
   * Create new packing list from budget
   */
  async createPackingList(data) {
    const budget = await budget_repository_default.findById(data.budgetId, data.organizationId);
    if (!budget) {
      throw new Error("Budget not found");
    }
    if (budget.status !== "APPROVED" && budget.status !== "INVOICED") {
      throw new Error("Can only create packing lists from approved or invoiced budgets");
    }
    return packing_list_repository_default.create(data);
  }
  /**
   * Update packing list
   */
  async updatePackingList(id, data, organizationId) {
    await this.getPackingListById(id, organizationId);
    return packing_list_repository_default.update(id, data);
  }
  /**
   * Generate PDF for packing list
   */
  async generatePdf(id) {
    const packingList = await packing_list_repository_default.findById(id);
    if (!packingList) {
      throw new Error("Packing list not found");
    }
    const { pdfGeneratorService: pdfGeneratorService2 } = await Promise.resolve().then(() => (init_pdf_generator_service(), pdf_generator_service_exports));
    const pdfUrl = await pdfGeneratorService2.generatePackingList(packingList);
    await packing_list_repository_default.updatePdfUrl(id, pdfUrl);
    return pdfUrl;
  }
  /**
   * Delete packing list
   */
  async deletePackingList(id, organizationId) {
    await this.getPackingListById(id, organizationId);
    return packing_list_repository_default.delete(id);
  }
  /**
   * Get packing lists by budget ID
   */
  async getPackingListsByBudgetId(budgetId) {
    const budget = await budget_repository_default.findById(budgetId);
    if (!budget) {
      throw new Error("Budget not found");
    }
    return packing_list_repository_default.findByBudgetId(budgetId);
  }
  /**
   * Auto-generate packing list details from budget
   */
  async autoGenerateFromBudget(budgetId, organizationId) {
    const budget = await budget_repository_default.findById(budgetId, organizationId);
    if (!budget) {
      throw new Error("Budget not found");
    }
    const items = budget.budgetItems.map((item) => ({
      productId: item.productId,
      productName: item.product.title,
      quantity: item.quantity,
      weight: item.product.weightKg ? item.product.weightKg * item.quantity : void 0,
      volume: item.product.volumeM3 ? item.product.volumeM3 * item.quantity : void 0
    }));
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0), 0);
    const totalVolume = items.reduce((sum, item) => sum + (item.volume || 0), 0);
    const details = {
      items,
      totalWeight: totalWeight > 0 ? totalWeight : void 0,
      totalVolume: totalVolume > 0 ? totalVolume : void 0
    };
    return this.createPackingList({
      budgetId,
      details
    });
  }
};
var packing_list_service_default = new PackingListService();

// src/schemas/packing-list.schema.ts
import { z as z9 } from "zod";
var packingListDetailsSchema = z9.object({
  items: z9.array(
    z9.object({
      productId: z9.string().cuid("Invalid product ID"),
      productName: z9.string(),
      quantity: z9.number().int().positive(),
      weight: z9.number().positive().optional(),
      volume: z9.number().positive().optional(),
      packageType: z9.string().optional(),
      packageCount: z9.number().int().positive().optional()
    })
  ).min(1, "At least one item is required"),
  totalWeight: z9.number().positive().optional(),
  totalVolume: z9.number().positive().optional(),
  totalPackages: z9.number().int().positive().optional(),
  notes: z9.string().max(1e3).optional()
});
var createPackingListSchema = z9.object({
  budgetId: z9.string().cuid("Invalid budget ID format"),
  details: packingListDetailsSchema,
  pdfUrl: z9.string().url("Invalid PDF URL").optional()
});
var updatePackingListSchema = createPackingListSchema.partial().omit({ budgetId: true });
var packingListIdSchema = z9.object({
  id: z9.string().cuid("Invalid packing list ID format")
});
var generatePdfSchema2 = z9.object({
  id: z9.string().cuid("Invalid packing list ID format")
});

// src/controllers/packing-list.controller.ts
var PackingListController = class {
  /**
   * @route GET /api/packing-lists
   * @summary Get all packing lists
   * @returns {PackingList[]} 200 - List of packing lists with pagination
   */
  async getAllPackingLists(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const budgetId = req.query.budgetId;
      const result = await packing_list_service_default.getAllPackingLists({
        budgetId,
        page,
        limit,
        organizationId: req.user?.organizationId
      });
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route GET /api/packing-lists/:id
   * @summary Get packing list by ID
   * @returns {PackingList} 200 - Packing list details
   */
  async getPackingListById(req, res, next) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      const packingList = await packing_list_service_default.getPackingListById(
        id,
        req.user?.organizationId
      );
      res.json({
        success: true,
        data: packingList
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/packing-lists
   * @summary Create new packing list from budget
   * @returns {PackingList} 201 - Created packing list
   */
  async createPackingList(req, res, next) {
    try {
      const data = createPackingListSchema.parse(req.body);
      const packingList = await packing_list_service_default.createPackingList({
        ...data,
        organizationId: req.user?.organizationId
      });
      res.status(201).json({
        success: true,
        data: packingList
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/packing-lists/auto-generate
   * @summary Auto-generate packing list from budget
   * @returns {PackingList} 201 - Created packing list
   */
  async autoGenerateFromBudget(req, res, next) {
    try {
      const { budgetId } = req.body;
      if (!budgetId) {
        throw new Error("budgetId is required");
      }
      const packingList = await packing_list_service_default.autoGenerateFromBudget(
        budgetId,
        req.user?.organizationId
      );
      res.status(201).json({
        success: true,
        data: packingList
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route PUT /api/packing-lists/:id
   * @summary Update packing list
   * @returns {PackingList} 200 - Updated packing list
   */
  async updatePackingList(req, res, next) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      const data = updatePackingListSchema.parse(req.body);
      const packingList = await packing_list_service_default.updatePackingList(
        id,
        data,
        req.user?.organizationId
      );
      res.json({
        success: true,
        data: packingList
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route POST /api/packing-lists/:id/generate-pdf
   * @summary Generate PDF for packing list
   * @returns {Object} 200 - PDF URL
   */
  async generatePdf(req, res, next) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      const pdfUrl = await packing_list_service_default.generatePdf(id);
      res.json({
        success: true,
        data: { pdfUrl }
      });
    } catch (error) {
      next(error);
    }
  }
  /**
   * @route DELETE /api/packing-lists/:id
   * @summary Delete packing list
   * @returns {Object} 200 - Success message
   */
  async deletePackingList(req, res, next) {
    try {
      const { id } = packingListIdSchema.parse(req.params);
      await packing_list_service_default.deletePackingList(id, req.user?.organizationId);
      res.json({
        success: true,
        message: "Packing list deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
};
var packing_list_controller_default = new PackingListController();

// src/routes/packing-list.routes.ts
var router14 = Router14();
router14.get("/", authenticate, packing_list_controller_default.getAllPackingLists.bind(packing_list_controller_default));
router14.get(
  "/:id",
  authenticate,
  packing_list_controller_default.getPackingListById.bind(packing_list_controller_default)
);
router14.post(
  "/",
  authenticate,
  authorize(Role10.ADMIN, Role10.TRADER, Role10.MANUFACTURER),
  packing_list_controller_default.createPackingList.bind(packing_list_controller_default)
);
router14.post(
  "/auto-generate",
  authenticate,
  authorize(Role10.ADMIN, Role10.TRADER, Role10.MANUFACTURER),
  packing_list_controller_default.autoGenerateFromBudget.bind(packing_list_controller_default)
);
router14.put(
  "/:id",
  authenticate,
  authorize(Role10.ADMIN, Role10.TRADER, Role10.MANUFACTURER),
  packing_list_controller_default.updatePackingList.bind(packing_list_controller_default)
);
router14.post(
  "/:id/generate-pdf",
  authenticate,
  authorize(Role10.ADMIN, Role10.TRADER, Role10.MANUFACTURER),
  packing_list_controller_default.generatePdf.bind(packing_list_controller_default)
);
router14.delete(
  "/:id",
  authenticate,
  authorize(Role10.ADMIN),
  packing_list_controller_default.deletePackingList.bind(packing_list_controller_default)
);
var packing_list_routes_default = router14;

// src/routes/public.routes.ts
import { Router as Router15 } from "express";
import { PrismaClient as PrismaClient16 } from "@prisma/client";
var router15 = Router15();
var prisma16 = new PrismaClient16();
router15.get("/catalog/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await prisma16.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true }
    });
    if (!user || user.role !== "MANUFACTURER" && user.role !== "TRADER") {
      throw new AppError(404, "Catalog not found");
    }
    const products = await prisma16.product.findMany({
      where: {
        isPublic: true,
        provider: {
          // Assuming providers are linked to users somehow
          // You may need to adjust this based on your actual schema
        }
      },
      include: {
        tariffPosition: true,
        unit: true,
        provider: {
          select: {
            id: true,
            name: true
          }
        },
        priceHistory: {
          where: { type: "SELLING" },
          orderBy: { date: "desc" },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      },
      products,
      total: products.length
    });
  } catch (error) {
    next(error);
  }
});
router15.get("/budget/:shareToken", async (req, res, next) => {
  try {
    const { shareToken } = req.params;
    const budget = await prisma16.budget.findUnique({
      where: { shareToken },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        budgetItems: {
          include: {
            product: {
              include: {
                tariffPosition: true,
                unit: true,
                provider: true
              }
            }
          }
        },
        costs: true
      }
    });
    if (!budget) {
      throw new AppError(404, "Budget not found or link has expired");
    }
    if (budget.expiresAt && new Date(budget.expiresAt) < /* @__PURE__ */ new Date()) {
      await prisma16.budget.update({
        where: { id: budget.id },
        data: { status: "EXPIRED" }
      });
      throw new AppError(410, "This budget link has expired");
    }
    await prisma16.budget.update({
      where: { id: budget.id },
      data: {
        viewCount: { increment: 1 },
        status: budget.status === "SENT" ? "VIEWED" : budget.status
      }
    });
    res.json(budget);
  } catch (error) {
    next(error);
  }
});
router15.post(
  "/budget/:shareToken/accept",
  async (req, res, next) => {
    try {
      const { shareToken } = req.params;
      const { prospectName, prospectEmail, prospectPhone, prospectAddress, prospectTaxId } = req.body;
      if (!prospectName || !prospectEmail) {
        throw new AppError(400, "Prospect name and email are required");
      }
      const budget = await prisma16.budget.findUnique({
        where: { shareToken },
        include: { client: true }
      });
      if (!budget) {
        throw new AppError(404, "Budget not found");
      }
      if (budget.expiresAt && new Date(budget.expiresAt) < /* @__PURE__ */ new Date()) {
        throw new AppError(410, "This budget link has expired");
      }
      if (budget.status === "APPROVED") {
        throw new AppError(400, "This budget has already been accepted");
      }
      let client2 = await prisma16.client.findFirst({
        where: { email: prospectEmail }
      });
      if (!client2) {
        client2 = await prisma16.client.create({
          data: {
            name: prospectName,
            email: prospectEmail,
            phone: prospectPhone,
            address: prospectAddress,
            taxId: prospectTaxId,
            convertedFrom: shareToken
            // Track conversion source
          }
        });
      }
      const updatedBudget = await prisma16.budget.update({
        where: { id: budget.id },
        data: {
          status: "APPROVED",
          acceptedAt: /* @__PURE__ */ new Date(),
          acceptedBy: prospectEmail,
          clientId: client2.id
          // Link to the client
        },
        include: {
          client: true,
          budgetItems: {
            include: {
              product: true
            }
          }
        }
      });
      res.json({
        message: "Budget accepted successfully",
        budget: updatedBudget,
        client: client2
      });
    } catch (error) {
      next(error);
    }
  }
);
var public_routes_default = router15;

// src/routes/user.routes.ts
import { Router as Router16 } from "express";

// src/controllers/user.controller.ts
import { Role as Role11 } from "@prisma/client";
var userRepository2 = new UserRepository();
var UserController = class {
  async getAll(req, res, next) {
    try {
      const organizationId = req.user?.role === Role11.ADMIN ? void 0 : req.user?.organizationId;
      const users = await userRepository2.findAll(organizationId);
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user?.role === Role11.ADMIN ? void 0 : req.user?.organizationId;
      const user = await userRepository2.findById(id, organizationId);
      if (!user) {
        throw new AppError(404, "User not found");
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
  async create(req, res, next) {
    try {
      const { email, password, name, role, organizationId } = req.body;
      const existingUser = await userRepository2.findByEmail(email);
      if (existingUser) {
        throw new AppError(409, "User with this email already exists");
      }
      const hashedPassword = await hashPassword(password);
      let finalOrganizationId = organizationId;
      if (req.user?.role !== Role11.ADMIN) {
        if (role === Role11.ADMIN) {
          throw new AppError(403, "Insufficient permissions to create Admin user");
        }
        const creator = await userRepository2.findById(req.user.id);
        finalOrganizationId = creator?.organizationId;
      }
      const user = await userRepository2.create({
        email,
        password: hashedPassword,
        name,
        role: role || Role11.CLIENT,
        organizationId: finalOrganizationId
      });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;
      const data = { name, email, role };
      if (password) {
        data.password = await hashPassword(password);
      }
      const organizationId = req.user?.role === Role11.ADMIN ? void 0 : req.user?.organizationId;
      const updatedUser = await userRepository2.update(id, data, organizationId);
      if (!updatedUser) {
        throw new AppError(404, "User not found or access denied");
      }
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const organizationId = req.user?.role === Role11.ADMIN ? void 0 : req.user?.organizationId;
      const deletedUser = await userRepository2.delete(id, organizationId);
      if (!deletedUser) {
        throw new AppError(404, "User not found or access denied");
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/user.routes.ts
import { Role as Role12 } from "@prisma/client";
var router16 = Router16();
var userController = new UserController();
router16.use(authenticate);
router16.get(
  "/",
  authorize(Role12.ADMIN, Role12.MANUFACTURER, Role12.TRADER),
  userController.getAll.bind(userController)
);
router16.get("/:id", userController.getById.bind(userController));
router16.post(
  "/",
  authorize(Role12.ADMIN, Role12.MANUFACTURER, Role12.TRADER),
  userController.create.bind(userController)
);
router16.put(
  "/:id",
  authorize(Role12.ADMIN, Role12.MANUFACTURER, Role12.TRADER),
  userController.update.bind(userController)
);
router16.delete("/:id", authorize(Role12.ADMIN), userController.delete.bind(userController));
var user_routes_default = router16;

// src/routes/bulk-import.routes.ts
import { Router as Router17 } from "express";

// src/controllers/bulk-import.controller.ts
import { Role as Role13 } from "@prisma/client";
import { parse } from "csv-parse/sync";
var productRepository5 = new ProductRepository();
var BulkImportController = class {
  async importProducts(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError(400, "No file uploaded");
      }
      const csvContent = req.file.buffer.toString("utf-8");
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      if (records.length > 1e3) {
        throw new AppError(400, "CSV file exceeds maximum of 1000 products");
      }
      if (records.length === 0) {
        throw new AppError(400, "CSV file is empty");
      }
      const results = {
        success: 0,
        failed: 0,
        errors: []
      };
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        try {
          if (!record.sku || !record.title) {
            throw new Error("Missing required fields: sku and title are required");
          }
          const existing = await productRepository5.findBySku(record.sku, req.user?.organizationId);
          if (existing) {
            throw new Error(`SKU ${record.sku} already exists`);
          }
          const productData = {
            sku: record.sku,
            title: record.title,
            description: record.description || void 0,
            weightKg: record.weightKg ? parseFloat(record.weightKg) : void 0,
            volumeM3: record.volumeM3 ? parseFloat(record.volumeM3) : void 0,
            composition: record.composition || void 0,
            tariffPositionId: record.tariffPositionId || void 0,
            unitId: record.unitId || void 0,
            providerId: record.providerId || void 0,
            organizationId: req.user?.organizationId || void 0
          };
          if (req.user?.role === Role13.MANUFACTURER && !productData.providerId) {
          }
          await productRepository5.create(productData);
          results.success++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            row: i + 2,
            // +2 because: +1 for 0-index, +1 for header row
            sku: record.sku,
            error: error.message
          });
        }
      }
      res.json({
        success: true,
        message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
        results
      });
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/bulk-import.routes.ts
import { Role as Role14 } from "@prisma/client";
import multer2 from "multer";
var router17 = Router17();
var bulkImportController = new BulkImportController();
var upload2 = multer2({
  storage: multer2.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"));
    }
  }
});
router17.post(
  "/products",
  authenticate,
  authorize(Role14.ADMIN, Role14.MANUFACTURER, Role14.TRADER),
  upload2.single("file"),
  bulkImportController.importProducts.bind(bulkImportController)
);
var bulk_import_routes_default = router17;

// src/routes/pricing.routes.ts
import { Router as Router18 } from "express";

// src/controllers/pricing-calculator.controller.ts
import { PrismaClient as PrismaClient17 } from "@prisma/client";

// src/services/pricing-calculator.service.ts
var PricingCalculatorService = class {
  constructor(prisma18) {
    this.prisma = prisma18;
  }
  /**
   * Calculate export price for products according to selected Incoterm
   */
  async calculateExportPrice(request, organizationId) {
    const config = await this.getPricingConfig(organizationId);
    const products = await this.fetchProducts(request.products.map((p) => p.productId));
    const expenses = await this.fetchExpenses(request.expenses);
    const incoterm = await this.getIncotermWithHierarchy(request.incoterm);
    if (!incoterm) {
      throw new Error(`Incoterm ${request.incoterm} not found`);
    }
    const applicableExpenses = this.filterExpensesByIncoterm(expenses, incoterm);
    const productResults = [];
    for (const productInput of request.products) {
      const product = products.find((p) => p.id === productInput.productId);
      if (!product) continue;
      const result = await this.calculateProductPrice(
        product,
        productInput.quantity,
        productInput.basePrice,
        applicableExpenses,
        incoterm.name,
        config,
        request.products,
        products
      );
      productResults.push(result);
    }
    const metadata = this.calculateMetadata(productResults, config);
    return {
      incoterm: request.incoterm,
      products: productResults,
      metadata
    };
  }
  /**
   * Calculate pricing for a single product
   */
  async calculateProductPrice(product, quantity, basePriceOverride, expenses, incotermName, config, allProductInputs, allProducts) {
    const breakdown = [];
    const latestSellingPrice = product.priceHistory.filter((ph) => ph.type === "SELLING").sort((a, b) => b.date.getTime() - a.date.getTime())[0];
    let basePrice = basePriceOverride ?? (latestSellingPrice ? Number(latestSellingPrice.value) : 0);
    if (config.adjustForVAT && config.vatRate) {
      basePrice = basePrice / (1 + Number(config.vatRate) / 100);
    }
    breakdown.push({
      label: "Base Export Price (BEP)",
      type: "product",
      amountPerUnit: basePrice,
      amountTotal: basePrice * quantity,
      includedInIncoterm: true
    });
    let currentUnitPrice = basePrice;
    const proratedExpenses = expenses.filter((e) => e.prorate);
    const nonProratedExpenses = expenses.filter((e) => !e.prorate);
    const totalProductsValue = allProductInputs.reduce((sum, input) => {
      const prod = allProducts.find((p) => p.id === input.productId);
      if (!prod) return sum;
      const prodPrice = input.basePrice ?? Number(
        prod.priceHistory.filter((ph) => ph.type === "SELLING").sort((a, b) => b.date.getTime() - a.date.getTime())[0]?.value ?? 0
      );
      return sum + prodPrice * input.quantity;
    }, 0);
    for (const expense of proratedExpenses) {
      const expenseShare = this.prorateExpense(
        expense,
        basePrice * quantity,
        totalProductsValue,
        quantity
      );
      breakdown.push({
        label: `${expense.description || expense.type} (prorated)`,
        type: "prorated",
        amountPerUnit: expenseShare.perUnit,
        amountTotal: expenseShare.total,
        includedInIncoterm: this.isExpenseIncludedInIncoterm(expense, incotermName)
      });
      if (this.isExpenseIncludedInIncoterm(expense, incotermName)) {
        currentUnitPrice += expenseShare.perUnit;
      }
    }
    for (const expense of nonProratedExpenses) {
      let amountPerUnit = 0;
      let amountTotal = Number(expense.value);
      if (expense.perUnitOrTotal === "PER_UNIT") {
        amountPerUnit = Number(expense.value);
        amountTotal = amountPerUnit * quantity;
      } else {
        const totalQuantity = allProductInputs.reduce((sum, p) => sum + p.quantity, 0);
        amountPerUnit = amountTotal / totalQuantity;
        amountTotal = amountPerUnit * quantity;
      }
      const included = this.isExpenseIncludedInIncoterm(expense, incotermName);
      breakdown.push({
        label: expense.description || expense.type,
        type: expense.type.toLowerCase(),
        amountPerUnit,
        amountTotal,
        includedInIncoterm: included
      });
      if (included) {
        currentUnitPrice += amountPerUnit;
      }
    }
    if (product.tariffPosition && ["FCA", "FOB", "CIF", "CFR", "CPT", "CIP", "DAP", "DDP"].includes(incotermName)) {
      const fobValue = currentUnitPrice * quantity;
      const dexResult = this.calculateDEX(fobValue, product.tariffPosition);
      if (dexResult.totalDEX > 0) {
        breakdown.push({
          label: "Export Duty (DEX)",
          type: "duty",
          amountPerUnit: dexResult.totalDEX / quantity,
          amountTotal: dexResult.totalDEX,
          includedInIncoterm: true,
          description: `Ad valorem: ${dexResult.adValoremAmount.toFixed(2)}, Fixed: ${dexResult.fixedAmount.toFixed(2)}`
        });
        currentUnitPrice += dexResult.totalDEX / quantity;
      }
    }
    currentUnitPrice = this.applyRounding(currentUnitPrice, config);
    return {
      productId: product.id,
      productName: product.title,
      quantity,
      unitPrice: currentUnitPrice,
      totalPrice: currentUnitPrice * quantity,
      breakdown
    };
  }
  /**
   * Calculate Export Duty (DEX)
   */
  calculateDEX(fobValue, tariffPosition) {
    if (!tariffPosition) {
      return {
        baseValue: fobValue,
        adValoremAmount: 0,
        fixedAmount: 0,
        totalDEX: 0,
        appliedMin: false,
        appliedMax: false
      };
    }
    let dex = 0;
    let adValoremAmount = 0;
    let fixedAmount = 0;
    if (tariffPosition.adValoremRate) {
      adValoremAmount = fobValue * (Number(tariffPosition.adValoremRate) / 100);
      dex += adValoremAmount;
    }
    if (tariffPosition.fixedExportDuty) {
      fixedAmount = Number(tariffPosition.fixedExportDuty);
      dex += fixedAmount;
    }
    let appliedMin = false;
    if (tariffPosition.exportDutyMinAmount && dex < Number(tariffPosition.exportDutyMinAmount)) {
      dex = Number(tariffPosition.exportDutyMinAmount);
      appliedMin = true;
    }
    let appliedMax = false;
    if (tariffPosition.exportDutyMaxAmount && dex > Number(tariffPosition.exportDutyMaxAmount)) {
      dex = Number(tariffPosition.exportDutyMaxAmount);
      appliedMax = true;
    }
    return {
      baseValue: fobValue,
      adValoremAmount,
      fixedAmount,
      totalDEX: dex,
      appliedMin,
      appliedMax
    };
  }
  /**
   * Prorate expense across products
   */
  prorateExpense(expense, productTotalValue, sumAllProductsValue, quantity) {
    if (sumAllProductsValue === 0) {
      return { perUnit: 0, total: 0 };
    }
    const percentage = productTotalValue / sumAllProductsValue;
    const total = Number(expense.value) * percentage;
    const perUnit = total / quantity;
    return { perUnit, total };
  }
  /**
   * Filter expenses by Incoterm applicability
   * An expense applies if the selected Incoterm is at or after the expense's incotermToBeIncluded
   */
  filterExpensesByIncoterm(expenses, _incoterm) {
    return expenses;
  }
  /**
   * Check if expense should be included in the given Incoterm
   */
  isExpenseIncludedInIncoterm(expense, incotermName) {
    const hierarchy = ["EXW", "FCA", "FOB", "CFR", "CIF", "CPT", "CIP", "DAP", "DDP"];
    const expenseIncotermIndex = hierarchy.indexOf(expense.incotermToBeIncluded.name);
    const selectedIncotermIndex = hierarchy.indexOf(incotermName);
    return selectedIncotermIndex >= expenseIncotermIndex;
  }
  /**
   * Apply rounding based on configuration
   */
  applyRounding(value, config) {
    const multiplier = Math.pow(10, config.precision);
    switch (config.roundingMode) {
      case "HALF_UP":
        return Math.round(value * multiplier) / multiplier;
      case "DOWN":
        return Math.floor(value * multiplier) / multiplier;
      case "UP":
        return Math.ceil(value * multiplier) / multiplier;
      default:
        return Math.round(value * multiplier) / multiplier;
    }
  }
  /**
   * Calculate metadata totals
   */
  calculateMetadata(products, config) {
    const totalFOB = products.reduce((sum, p) => sum + p.totalPrice, 0);
    return {
      currency: config.baseCurrency,
      precision: config.precision,
      roundingMode: config.roundingMode,
      calculatedAt: /* @__PURE__ */ new Date(),
      totalFOB,
      totalCIF: totalFOB
      // Will be enhanced later
    };
  }
  /**
   * Fetch products with tariff and price history
   */
  async fetchProducts(productIds) {
    return this.prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        tariffPosition: true,
        priceHistory: {
          orderBy: { date: "desc" }
        }
      }
    });
  }
  /**
   * Fetch expenses/costs
   */
  async fetchExpenses(expenseIds) {
    return this.prisma.cost.findMany({
      where: { id: { in: expenseIds } },
      include: {
        incotermToBeIncluded: true
      }
    });
  }
  /**
   * Get Incoterm with hierarchy
   */
  async getIncotermWithHierarchy(name) {
    return this.prisma.incoterm.findUnique({
      where: { name },
      include: {
        previousIncoterm: true,
        nextIncoterms: true
      }
    });
  }
  /**
   * Get pricing configuration for organization
   */
  async getPricingConfig(organizationId) {
    const config = await this.prisma.pricingConfiguration.findUnique({
      where: { organizationId }
    });
    if (!config) {
      return {
        adjustForVAT: false,
        baseCurrency: "USD",
        roundingMode: "HALF_UP",
        precision: 2
      };
    }
    return {
      adjustForVAT: config.adjustForVAT,
      vatRate: config.vatRate ?? void 0,
      baseCurrency: config.baseCurrency,
      roundingMode: config.roundingMode,
      precision: config.precision
    };
  }
};

// src/controllers/pricing-calculator.controller.ts
import { z as z10 } from "zod";
var prisma17 = new PrismaClient17();
var pricingService = new PricingCalculatorService(prisma17);
var productInputSchema = z10.object({
  productId: z10.string().cuid(),
  quantity: z10.number().int().positive(),
  basePrice: z10.number().positive().optional()
});
var calculatePricingSchema = z10.object({
  products: z10.array(productInputSchema).min(1),
  expenses: z10.array(z10.string().cuid()),
  incoterm: z10.string().min(2).max(3),
  // EXW, FCA, FOB, CIF, etc.
  currency: z10.string().optional(),
  exchangeRate: z10.number().positive().optional()
});
var pricingConfigSchema = z10.object({
  adjustForVAT: z10.boolean().optional(),
  vatRate: z10.number().min(0).max(100).optional(),
  baseCurrency: z10.string().optional(),
  roundingMode: z10.enum(["HALF_UP", "DOWN", "UP"]).optional(),
  precision: z10.number().int().min(0).max(10).optional()
});
var calculatePricing = async (req, res, next) => {
  try {
    const validatedData = calculatePricingSchema.parse(req.body);
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: "Organization ID required" });
    }
    const result = await pricingService.calculateExportPrice(
      validatedData,
      organizationId
    );
    return res.json(result);
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    return next(error);
  }
};
var calculatePricingBatch = async (req, res, next) => {
  try {
    const batchSchema = z10.object({
      scenarios: z10.array(calculatePricingSchema).min(1).max(10)
    });
    const validatedData = batchSchema.parse(req.body);
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: "Organization ID required" });
    }
    const results = await Promise.all(
      validatedData.scenarios.map(
        (scenario) => pricingService.calculateExportPrice(scenario, organizationId)
      )
    );
    return res.json({ scenarios: results });
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    return next(error);
  }
};
var getPricingConfig = async (req, res, next) => {
  try {
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: "Organization ID required" });
    }
    const config = await prisma17.pricingConfiguration.findUnique({
      where: { organizationId }
    });
    if (!config) {
      return res.json({
        adjustForVAT: false,
        baseCurrency: "USD",
        roundingMode: "HALF_UP",
        precision: 2
      });
    }
    return res.json(config);
  } catch (error) {
    return next(error);
  }
};
var updatePricingConfig = async (req, res, next) => {
  try {
    const validatedData = pricingConfigSchema.parse(req.body);
    const organizationId = req.user?.organizationId;
    if (!organizationId) {
      return res.status(401).json({ error: "Organization ID required" });
    }
    const config = await prisma17.pricingConfiguration.upsert({
      where: { organizationId },
      update: validatedData,
      create: {
        organizationId,
        ...validatedData
      }
    });
    return res.json(config);
  } catch (error) {
    if (error instanceof z10.ZodError) {
      return res.status(400).json({ error: "Validation error", details: error.errors });
    }
    return next(error);
  }
};
var getIncoterms = async (_req, res, next) => {
  try {
    const incoterms = await prisma17.incoterm.findMany({
      orderBy: { name: "asc" },
      include: {
        previousIncoterm: {
          select: { id: true, name: true }
        }
      }
    });
    res.json(incoterms);
  } catch (error) {
    next(error);
  }
};

// src/routes/pricing.routes.ts
var router18 = Router18();
router18.post("/calculate", authenticate, calculatePricing);
router18.post("/calculate-batch", authenticate, calculatePricingBatch);
router18.get("/config", authenticate, getPricingConfig);
router18.put("/config", authenticate, updatePricingConfig);
router18.get("/incoterms", authenticate, getIncoterms);
var pricing_routes_default = router18;

// src/middlewares/idempotency.middleware.ts
init_redis_client();
var IDEMPOTENCY_PREFIX = "idempotency:";
var DEFAULT_TTL = 24 * 60 * 60;
var idempotency = async (req, res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }
  const idempotencyKey = req.headers["x-idempotency-key"];
  if (!idempotencyKey) {
    return next();
  }
  const userId = req.user?.id || req.ip || "anonymous";
  const redisKey = `${IDEMPOTENCY_PREFIX}${userId}:${idempotencyKey}`;
  try {
    const cachedResponse = await redis_client_default.get(redisKey);
    if (cachedResponse) {
      const { status, body } = JSON.parse(cachedResponse);
      console.log(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
      res.setHeader("X-Idempotency-Cache", "HIT");
      return res.status(status).json(body);
    }
    const originalJson = res.json;
    let cached = false;
    const cacheResponse = async (status, body) => {
      if (cached) return;
      cached = true;
      if (status >= 500) return;
      try {
        const responseToCache = JSON.stringify({
          status,
          body,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        await redis_client_default.set(redisKey, responseToCache, {
          EX: DEFAULT_TTL
        });
        console.log(`[Idempotency] Cached response for key: ${idempotencyKey}`);
      } catch (err) {
        console.error("[Idempotency] Error caching response:", err);
      }
    };
    res.json = function(body) {
      cacheResponse(res.statusCode, body);
      return originalJson.call(this, body);
    };
    res.setHeader("X-Idempotency-Cache", "MISS");
    next();
  } catch (error) {
    console.error("[Idempotency] Redis Error:", error);
    next();
  }
};

// src/server.ts
var app = express();
var PORT = process.env.PORT || 4e3;
var logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true
    }
  }
});
var httpLogger = pinoHttp({ logger });
app.use(httpLogger);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", limiter);
app.use("/api/", idempotency);
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 10,
  // Only 10 requests per 15 minutes for auth endpoints
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/auth/", authLimiter);
var swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Export Management API",
      version: "1.0.0",
      description: "API for managing export operations, budgets, and logistics"
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ["./src/routes/*.ts"]
};
var swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    uptime: process.uptime()
  });
});
app.get("/", (_req, res) => {
  res.json({
    message: "Export Management API",
    version: "1.0.0",
    documentation: "/api/docs"
  });
});
app.use("/api/public", public_routes_default);
app.use("/api/auth", auth_routes_default);
app.use("/api/users", user_routes_default);
app.use("/api/budgets", budget_routes_default);
app.use("/api/products", product_routes_default);
app.use("/api/providers", provider_routes_default);
app.use("/api/clients", client_routes_default);
app.use("/api/costs", cost_routes_default);
app.use("/api/tariff-positions", tariff_position_routes_default);
app.use("/api/units", unit_of_measure_routes_default);
app.use("/api/countries", country_routes_default);
app.use("/api/export-tasks", export_task_routes_default);
app.use("/api/taxes", tax_routes_default);
app.use("/api/price-history", price_history_routes_default);
app.use("/api/invoices", invoice_routes_default);
app.use("/api/packing-lists", packing_list_routes_default);
app.use("/api/bulk-import", bulk_import_routes_default);
app.use("/api/pricing", pricing_routes_default);
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`
  });
});
app.use(errorHandler);
var startServer = async () => {
  try {
    const { connectRedis: connectRedis2 } = await Promise.resolve().then(() => (init_redis_client(), redis_client_exports));
    await connectRedis2();
    if (process.env.VERCEL !== "1") {
      app.listen(PORT, () => {
        logger.info(`\u{1F680} Server running on http://localhost:${PORT}`);
        logger.info(`\u{1F4DA} API Documentation available at http://localhost:${PORT}/api/docs`);
        logger.info(`\u{1F3E5} Health check available at http://localhost:${PORT}/health`);
      });
    }
  } catch (error) {
    logger.error("Failed to start server:", error);
    if (process.env.VERCEL !== "1") {
      process.exit(1);
    }
  }
};
startServer();
var server_default = app;
export {
  server_default as default
};
