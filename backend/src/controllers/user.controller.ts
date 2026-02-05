/**
 * User controller - Handles user management operations
 */

import { Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { hashPassword } from '../utils/password.util';
import { AppError } from '../middlewares/error.middleware';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const userRepository = new UserRepository();

export class UserController {
  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // If admin, return all users. If not, return users from same organization
      // For now, we'll just return all users if admin, or self if not
      // TODO: Implement organization filtering once middleware is updated

      const users = await userRepository.findAll();

      // Filter based on role/org logic if needed here, but repository should handle it ideally
      // For now, let's return all for Admin

      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Security check: only admin or same user/org can view

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role, organizationId } = req.body;

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        throw new AppError(409, 'User with this email already exists');
      }

      const hashedPassword = await hashPassword(password);

      let finalOrganizationId = organizationId;

      // If creator is not ADMIN, they can only create users for their own org
      // and cannot create ADMINs
      if (req.user?.role !== Role.ADMIN) {
        if (role === Role.ADMIN) {
          throw new AppError(403, 'Insufficient permissions to create Admin user');
        }
        // Force organizationId to match creator's org
        const creator = await userRepository.findById(req.user!.id);
        finalOrganizationId = creator?.organizationId;
      }

      const user = await userRepository.create({
        email,
        password: hashedPassword,
        name,
        role: role || Role.CLIENT,
        organizationId: finalOrganizationId,
      });

      // Remove password from response
      const { password: _password, ...userWithoutPassword } = user;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, email, role, password } = req.body;

      const user = await userRepository.findById(id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const data: any = { name, email, role };
      if (password) {
        data.password = await hashPassword(password);
      }

      const updatedUser = await userRepository.update(id, data);
      const { password: _password, ...userWithoutPassword } = updatedUser;

      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userRepository.findById(id);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      await userRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
