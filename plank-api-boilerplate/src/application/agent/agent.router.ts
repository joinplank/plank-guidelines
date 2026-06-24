import { FastifyInstance } from 'fastify';
import { AppContainer } from '../../shared/config/awilix.config';

export async function agentRouter(
  fastify: FastifyInstance,
  options: { container: AppContainer }
): Promise<void> {
  const ctrl = options.container.resolve('agentController');

  fastify.get('/v1/users/:userId/runs', (req, reply) => ctrl.findByUserId(req, reply));
  fastify.get('/v1/runs/:id', (req, reply) => ctrl.findById(req, reply));
  fastify.post('/v1/runs', (req, reply) => ctrl.run(req, reply));
}
