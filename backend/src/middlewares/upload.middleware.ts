import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const isVercel = process.env.VERCEL === '1';

// ---------------------------------------------------------------------------
// Multer storage engine: disk for local, memory for Vercel
// ---------------------------------------------------------------------------

let storage: multer.StorageEngine;

if (isVercel) {
  // Vercel: read-only filesystem → keep files in memory
  storage = multer.memoryStorage();
} else {
  // Local / Docker: write to disk
  const uploadsDir = path.join(process.cwd(), 'uploads/products');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb) => {
      cb(null, uploadsDir);
    },
    filename: (_req: Request, file: Express.Multer.File, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      cb(null, `${basename}-${uniqueSuffix}${ext}`);
    },
  });
}

// ---------------------------------------------------------------------------
// File filter — images only
// ---------------------------------------------------------------------------

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// ---------------------------------------------------------------------------
// Configured multer instance
// ---------------------------------------------------------------------------

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});
