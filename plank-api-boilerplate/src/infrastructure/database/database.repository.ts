import { PrismaClient } from '@prisma/client';

export class DatabaseRepository {
  protected readonly prisma: PrismaClient;

  constructor({ prismaClient }: { prismaClient: PrismaClient }) {
    this.prisma = prismaClient;
  }
}
