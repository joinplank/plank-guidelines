import { User } from '@prisma/client';
import { AppError } from '../../shared/errors/app.error';
import { CreateUserInput, UpdateUserInput } from './user.model';
import { IUserRepository } from './user.repository';

export interface IUserService {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User>;
  delete(id: string): Promise<void>;
}

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new AppError('USER_EMAIL_TAKEN', 'Email already in use', 409);
    return this.userRepository.create(input);
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await this.findById(id);
    return this.userRepository.update(id, input);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.delete(id);
  }
}
