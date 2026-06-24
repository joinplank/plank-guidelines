import Fastify, { FastifyInstance } from 'fastify';
import sensible from '@fastify/sensible';
import { AppError } from './shared/errors/app.error';
import { AppContainer } from './shared/config/awilix.config';
import { userRouter } from './application/user/user.router';
import { agentRouter } from './application/agent/agent.router';

export async function buildApp(container: AppContainer): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
  });

  const sentry = container.resolve('sentryProvider');
  sentry.init();

  await fastify.register(sensible);

  fastify.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        error: { code: error.code, message: error.message, details: error.details },
      });
      return;
    }

    if (error.name === 'ZodError') {
      reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid request', details: error.message },
      });
      return;
    }

    sentry.captureException(error);
    fastify.log.error(error);

    reply.status(500).send({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error', details: null },
    });
  });

  await fastify.register(userRouter, { container });
  await fastify.register(agentRouter, { container });

  fastify.get('/health', async () => ({ status: 'ok' }));

  return fastify;
}
