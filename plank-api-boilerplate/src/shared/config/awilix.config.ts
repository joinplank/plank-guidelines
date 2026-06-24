import { createContainer, asClass, asValue, asFunction, InjectionMode, AwilixContainer } from 'awilix';
import { PrismaClient } from '@prisma/client';
import type { StructuredToolInterface } from '@langchain/core/tools';

import { DatabaseRepository } from '../../infrastructure/database/database.repository';
import { SentryProvider, ISentryProvider } from '../../infrastructure/providers/sentry.provider';
import { ResendProvider, IResendProvider } from '../../infrastructure/providers/resend.provider';
import { S3Provider, IS3Provider } from '../../infrastructure/providers/s3.provider';
import { createIoTool } from '../../infrastructure/tools/io.tool';
import { createSearchWebTool } from '../../infrastructure/tools/search-web.tool';
import { createFetchTool } from '../../infrastructure/tools/fetch.tool';

import { UserRepository, IUserRepository } from '../../application/user/user.repository';
import { UserService, IUserService } from '../../application/user/user.service';
import { UserController } from '../../application/user/user.controller';

import { AgentRepository, IAgentRepository } from '../../application/agent/agent.repository';
import { AgentService, IAgentService } from '../../application/agent/agent.service';
import { AgentController } from '../../application/agent/agent.controller';

export interface ContainerDeps {
  prismaClient: PrismaClient;
  databaseRepository: DatabaseRepository;
  sentryProvider: ISentryProvider;
  resendProvider: IResendProvider;
  s3Provider: IS3Provider;
  ioTool: StructuredToolInterface;
  searchWebTool: StructuredToolInterface;
  fetchTool: StructuredToolInterface;
  userRepository: IUserRepository;
  userService: IUserService;
  userController: UserController;
  agentRepository: IAgentRepository;
  agentService: IAgentService;
  agentController: AgentController;
}

export type AppContainer = AwilixContainer<ContainerDeps>;

export function buildContainer(): AppContainer {
  const container = createContainer<ContainerDeps>({ injectionMode: InjectionMode.PROXY });

  container.register({
    // Core
    prismaClient: asValue(new PrismaClient()),

    // Infrastructure — providers
    databaseRepository: asClass(DatabaseRepository).singleton(),
    sentryProvider: asClass(SentryProvider).singleton(),
    resendProvider: asClass(ResendProvider).singleton(),
    s3Provider: asClass(S3Provider).singleton(),

    // Infrastructure — LangChain tools (wrapped so Awilix does not inject into them)
    ioTool: asFunction(() => createIoTool()).singleton(),
    searchWebTool: asFunction(() => createSearchWebTool()).singleton(),
    fetchTool: asFunction(() => createFetchTool()).singleton(),

    // User module
    userRepository: asClass(UserRepository).singleton(),
    userService: asClass(UserService).singleton(),
    userController: asClass(UserController).singleton(),

    // Agent module
    agentRepository: asClass(AgentRepository).singleton(),
    agentService: asClass(AgentService).singleton(),
    agentController: asClass(AgentController).singleton(),
  });

  return container;
}
