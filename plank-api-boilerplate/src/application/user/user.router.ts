import { FastifyInstance } from 'fastify';
import { AppContainer } from '../../shared/config/awilix.config';

export async function userRouter(
  fastify: FastifyInstance,
  options: { container: AppContainer }
): Promise<void> {
  const ctrl = options.container.resolve('userController');

  fastify.get('/v1/users', (req, reply) => ctrl.findAll(req, reply));
  fastify.get('/v1/users/:id', (req, reply) => ctrl.findById(req, reply));
  fastify.post('/v1/users', (req, reply) => ctrl.create(req, reply));
  fastify.put('/v1/users/:id', (req, reply) => ctrl.update(req, reply));
  fastify.delete('/v1/users/:id', (req, reply) => ctrl.delete(req, reply));
}
