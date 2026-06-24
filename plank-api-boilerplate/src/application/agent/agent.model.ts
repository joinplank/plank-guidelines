import { z } from 'zod';

export const CreateAgentRunSchema = z.object({
  userId: z.string().cuid(),
  query: z.string().min(1).max(2000),
});

export const AgentRunParamsSchema = z.object({
  id: z.string().cuid(),
});

export const UserRunsParamsSchema = z.object({
  userId: z.string().cuid(),
});

export type CreateAgentRunInput = z.infer<typeof CreateAgentRunSchema>;
export type AgentRunParams = z.infer<typeof AgentRunParamsSchema>;
export type UserRunsParams = z.infer<typeof UserRunsParamsSchema>;
