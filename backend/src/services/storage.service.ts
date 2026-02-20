import fs from 'fs';
import path from 'path';
import pino from 'pino';

const logger = pino({ name: 'storage-service' });

const isVercel = process.env.VERCEL === '1';

// ---------------------------------------------------------------------------
// Storage Provider Interface
// ---------------------------------------------------------------------------

export interface StorageProvider {
  /**
   * Upload a file buffer and return its public URL.
   */
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>;

  /**
   * Delete a previously uploaded file by its URL or key.
   */
  delete(urlOrKey: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Local Filesystem Provider (Docker / local development)
// ---------------------------------------------------------------------------

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(subdir: string) {
    this.baseDir = path.join(process.cwd(), 'uploads', subdir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(key: string, buffer: Buffer, _contentType: string): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    fs.writeFileSync(filePath, buffer);
    // Return a relative URL that express.static will serve
    const subdir = path.basename(this.baseDir);
    return `/uploads/${subdir}/${key}`;
  }

  async delete(urlOrKey: string): Promise<void> {
    // Extract filename from URL or use as-is
    const filename = urlOrKey.includes('/') ? urlOrKey.split('/').pop()! : urlOrKey;
    const filePath = path.join(this.baseDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

// ---------------------------------------------------------------------------
// Vercel Blob Provider
// ---------------------------------------------------------------------------

class VercelBlobStorageProvider implements StorageProvider {
  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    // Dynamic import to avoid loading @vercel/blob in non-Vercel environments
    const { put } = await import('@vercel/blob');
    const blob = await put(key, buffer, {
      access: 'public',
      contentType,
    });
    return blob.url;
  }

  async delete(urlOrKey: string): Promise<void> {
    const { del } = await import('@vercel/blob');
    await del(urlOrKey);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

const providers: Record<string, StorageProvider> = {};

/**
 * Get a storage provider for the given subdirectory (e.g. 'products', 'pdfs').
 * Automatically selects Local or Vercel Blob based on the deployment environment.
 */
export function getStorageProvider(subdir: string = 'products'): StorageProvider {
  const cacheKey = `${isVercel ? 'vercel' : 'local'}-${subdir}`;

  if (!providers[cacheKey]) {
    if (isVercel) {
      logger.info(`Using Vercel Blob storage for "${subdir}"`);
      providers[cacheKey] = new VercelBlobStorageProvider();
    } else {
      logger.info(`Using local filesystem storage for "${subdir}"`);
      providers[cacheKey] = new LocalStorageProvider(subdir);
    }
  }

  return providers[cacheKey];
}

/**
 * Whether the app is running on Vercel.
 */
export function isRunningOnVercel(): boolean {
  return isVercel;
}
