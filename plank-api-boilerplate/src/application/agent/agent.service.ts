import { AgentRun } from '@prisma/client';
import { ChatAnthropic } from '@langchain/anthropic';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import type { StructuredToolInterface } from '@langchain/core/tools';
import { AppError } from '../../shared/errors/app.error';
import { CreateAgentRunInput } from './agent.model';
import { IAgentRepository } from './agent.repository';

export interface IAgentService {
  findByUserId(userId: string): Promise<AgentRun[]>;
  findById(id: string): Promise<AgentRun>;
  run(input: CreateAgentRunInput): Promise<AgentRun>;
}

export class AgentService implements IAgentService {
  private readonly agentRepository: IAgentRepository;
  private readonly tools: StructuredToolInterface[];
  private readonly llm: ChatAnthropic;

  constructor({
    agentRepository,
    ioTool,
    searchWebTool,
    fetchTool,
  }: {
    agentRepository: IAgentRepository;
    ioTool: StructuredToolInterface;
    searchWebTool: StructuredToolInterface;
    fetchTool: StructuredToolInterface;
  }) {
    this.agentRepository = agentRepository;
    this.tools = [ioTool, searchWebTool, fetchTool];
    this.llm = new ChatAnthropic({
      model: 'claude-sonnet-4-6',
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async findByUserId(userId: string): Promise<AgentRun[]> {
    return this.agentRepository.findByUserId(userId);
  }

  async findById(id: string): Promise<AgentRun> {
    const run = await this.agentRepository.findById(id);
    if (!run) throw new AppError('RUN_NOT_FOUND', 'Agent run not found', 404);
    return run;
  }

  async run(input: CreateAgentRunInput): Promise<AgentRun> {
    const run = await this.agentRepository.create(input);
    await this.agentRepository.update(run.id, { status: 'RUNNING' });

    try {
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are a helpful research assistant. Use the available tools to thoroughly answer the user query.',
        ],
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad'),
      ]);

      const agent = createToolCallingAgent({ llm: this.llm, tools: this.tools, prompt });
      const executor = new AgentExecutor({ agent, tools: this.tools });

      const result = await executor.invoke({ input: input.query });

      return this.agentRepository.update(run.id, {
        result: String(result.output),
        status: 'COMPLETED',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        steps: (result.intermediateSteps ?? []) as any,
      });
    } catch (error) {
      await this.agentRepository.update(run.id, { status: 'FAILED' });
      throw error;
    }
  }
}
