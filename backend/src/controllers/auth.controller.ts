/**
 * Authentication controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  private setTokenCookie(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    });
  }

  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register((req as any).body);
      this.setTokenCookie(res, result.token);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = (req as any).body;
      const result = await authService.login(email, password);
      this.setTokenCookie(res, result.token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      res.json({ user: req.user });
    } catch (error) {
      next(error);
    }
  }
}
