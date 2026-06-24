import { AgentRun, RunStatus, Prisma } from '@prisma/client';
import { DatabaseRepository } from '../../infrastructure/database/database.repository';

export interface IAgentRepository {
  findById(id: string): Promise<AgentRun | null>;
  findByUserId(userId: string): Promise<AgentRun[]>;
  create(data: { userId: string; query: string }): Promise<AgentRun>;
  update(
    id: string,
    data: { status?: RunStatus; result?: string; steps?: Prisma.InputJsonValue }
  ): Promise<AgentRun>;
}

export class AgentRepository extends DatabaseRepository implements IAgentRepository {
  async findById(id: string): Promise<AgentRun | null> {
    return this.prisma.agentRun.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<AgentRun[]> {
    return this.prisma.agentRun.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { userId: string; query: string }): Promise<AgentRun> {
    return this.prisma.agentRun.create({ data });
  }

  async update(
    id: string,
    data: { status?: RunStatus; result?: string; steps?: Prisma.InputJsonValue }
  ): Promise<AgentRun> {
    return this.prisma.agentRun.update({ where: { id }, data });
  }
}
