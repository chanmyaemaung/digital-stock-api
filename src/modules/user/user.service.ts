import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IUserRepository } from '@app/core/interfaces/repositories/user.repository.interface';
import { User } from '@app/core/domain/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findByPhone(phone);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.findById(id);
    return this.userRepository.update(id, data);
  }
}
