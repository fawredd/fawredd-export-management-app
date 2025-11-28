/**
 * User repository - Database access layer for users
 */

import { PrismaClient, User, Role } from '@prisma/client';
import redisClient from '@/utils/redis-client';

const prisma = new PrismaClient();
const CACHE_TTL = 60 * 60 * 24;
const CACHE_KEY = 'users';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    const cachedUser = await redisClient.get(`${CACHE_KEY}:${id}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      await redisClient.set(`${CACHE_KEY}:${id}`, JSON.stringify(user), {
        EX: CACHE_TTL,
      });
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}
