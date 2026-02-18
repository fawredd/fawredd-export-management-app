/**
 * Idempotency middleware using Redis
 * Prevents duplicate requests by caching responses for unique keys
 */

import { Request, Response, NextFunction } from 'express';
import redisClient from '../utils/redis-client';

const IDEMPOTENCY_PREFIX = 'idempotency:';
const DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds

export const idempotency = async (req: Request, res: Response, next: NextFunction) => {
  // Only apply to state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const idempotencyKey = req.headers['x-idempotency-key'] as string;

  if (!idempotencyKey) {
    // If no key is provided, we let it pass but it won't be idempotent
    return next();
  }

  // Get user ID or use anonymous/IP for key isolation
  const userId = (req as any).user?.id || req.ip || 'anonymous';
  const redisKey = `${IDEMPOTENCY_PREFIX}${userId}:${idempotencyKey}`;

  try {
    // Check if the key exists in Redis
    const cachedResponse = await redisClient.get(redisKey);

    if (cachedResponse) {
      const { status, body } = JSON.parse(cachedResponse);
      
      console.log(`[Idempotency] Returning cached response for key: ${idempotencyKey}`);
      
      res.setHeader('X-Idempotency-Cache', 'HIT');
      return res.status(status).json(body);
    }

    // Key not found, intercept response to cache it
    const originalJson = res.json;

    // Use a flag to ensure we only cache once
    let cached = false;

    const cacheResponse = async (status: number, body: any) => {
      if (cached) return;
      cached = true;

      // Only cache successful or client-side error responses (optional: maybe only success?)
      // We generally want to cache successes and maybe 4xx validation errors
      if (status >= 500) return;

      try {
        const responseToCache = JSON.stringify({
          status,
          body,
          timestamp: new Date().toISOString(),
        });

        await redisClient.set(redisKey, responseToCache, {
          EX: DEFAULT_TTL,
        });
        console.log(`[Idempotency] Cached response for key: ${idempotencyKey}`);
      } catch (err) {
        console.error('[Idempotency] Error caching response:', err);
      }
    };

    // Override res.json as most API responses use it
    res.json = function (body) {
      // For some reason, if it's already a string, it might be double stringified
      // Express 5.x res.json handles this, but let's be careful
      cacheResponse(res.statusCode, body);
      return originalJson.call(this, body);
    };

    res.setHeader('X-Idempotency-Cache', 'MISS');
    next();
  } catch (error) {
    console.error('[Idempotency] Redis Error:', error);
    // If Redis fails, we should allow the request to proceed to not block the user
    next();
  }
};
