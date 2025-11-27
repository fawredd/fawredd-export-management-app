/**
 * JWT utility functions
 */

import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

export interface JWTPayload {
  id: string;
  email: string;
  role: Role;
}

export const generateToken = (payload: JWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, jwtSecret) as JWTPayload;
};
