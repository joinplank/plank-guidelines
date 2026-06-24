import { FastifyRequest, FastifyReply } from 'fastify';
import { IAgentService } from './agent.service';
import { CreateAgentRunSchema, AgentRunParamsSchema, UserRunsParamsSchema } from './agent.model';

export class AgentController {
  private readonly agentService: IAgentService;

  constructor({ agentService }: { agentService: IAgentService }) {
    this.agentService = agentService;
  }

  async findByUserId(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { userId } = UserRunsParamsSchema.parse(request.params);
    const runs = await this.agentService.findByUserId(userId);
    reply.send(runs);
  }

  async findById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = AgentRunParamsSchema.parse(request.params);
    const run = await this.agentService.findById(id);
    reply.send(run);
  }

  async run(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateAgentRunSchema.parse(request.body);
    const agentRun = await this.agentService.run(input);
    reply.status(202).send(agentRun);
  }
}
