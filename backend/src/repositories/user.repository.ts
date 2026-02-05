/**
 * User repository - Database access layer for users
 */

import { PrismaClient, User, Role } from '@prisma/client';
import redisClient from '../utils/redis-client';

const prisma = new PrismaClient();
const CACHE_TTL = 60 * 60 * 24;
const CACHE_KEY = 'users';

export class UserRepository {
  async findById(
    id: string,
    organizationId?: string | null,
  ): Promise<Omit<User, 'password'> | null> {
    const cachedUser = await redisClient.get(`${CACHE_KEY}:${id}`);
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      if (!organizationId || parsed.organizationId === organizationId) {
        return parsed;
      }
    }
    const user = await prisma.user.findFirst({
      where: {
        id,
        ...(organizationId ? { organizationId } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (user) {
      await redisClient.set(`${CACHE_KEY}:${id}`, JSON.stringify(user), {
        EX: CACHE_TTL,
      });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    // We need password for authentication, so we keep findByEmail as is but use it carefully
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
    organizationId?: string;
  }): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.create({ data });
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(organizationId?: string | null): Promise<Omit<User, 'password'>[]> {
    return prisma.user.findMany({
      where: organizationId ? { organizationId } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    id: string,
    data: Partial<User>,
    organizationId?: string | null,
  ): Promise<Omit<User, 'password'> | null> {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    const user = await prisma.user.update({
      where: { id },
      data,
    });
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string, organizationId?: string | null): Promise<User | null> {
    if (organizationId) {
      const existing = await this.findById(id, organizationId);
      if (!existing) return null;
    }
    return prisma.user.delete({ where: { id } });
  }
}
