import { FastifyRequest, FastifyReply } from 'fastify';
import { IUserService } from './user.service';
import { CreateUserSchema, UpdateUserSchema, UserParamsSchema } from './user.model';

export class UserController {
  private readonly userService: IUserService;

  constructor({ userService }: { userService: IUserService }) {
    this.userService = userService;
  }

  async findAll(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const users = await this.userService.findAll();
    reply.send(users);
  }

  async findById(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = UserParamsSchema.parse(request.params);
    const user = await this.userService.findById(id);
    reply.send(user);
  }

  async create(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const input = CreateUserSchema.parse(request.body);
    const user = await this.userService.create(input);
    reply.status(201).send(user);
  }

  async update(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = UserParamsSchema.parse(request.params);
    const input = UpdateUserSchema.parse(request.body);
    const user = await this.userService.update(id, input);
    reply.send(user);
  }

  async delete(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { id } = UserParamsSchema.parse(request.params);
    await this.userService.delete(id);
    reply.status(204).send();
  }
}
