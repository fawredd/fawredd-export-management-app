/**
 * Authentication service - Business logic for auth operations
 */

import { UserRepository } from '../repositories/user.repository';
import { hashPassword, comparePassword } from '../utils/password.util';
import { generateToken } from '../utils/jwt.util';
import { AppError } from '../middlewares/error.middleware';
import { Role } from '@prisma/client';

const userRepository = new UserRepository();

export class AuthService {
  async register(data: { email: string; password: string; name?: string; role?: Role }) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    const genericErrorMessage = 'Invalid email or password';

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
      organizationId: user.organizationId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
      token,
    };
  }
}
