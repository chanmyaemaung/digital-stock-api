import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/core/domain/entities/user.entity';
import { Role } from '@app/core/domain/enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['subscriptions', 'subscriptions.plan'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmailOrPhone(
    email?: string,
    phone?: string,
  ): Promise<User | null> {
    if (!email && !phone) {
      return null;
    }

    return this.userRepository.findOne({
      where: [{ email: email || '' }, { phone: phone || '' }],
      relations: ['subscriptions', 'subscriptions.plan'],
    });
  }

  async create(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    ipAddress: string;
    deviceInfo: any;
  }): Promise<User> {
    const user = this.userRepository.create({
      ...data,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    // Remove sensitive fields from update data
    const { password, role, ...safeUpdateData } = updateData;

    const updatedUser = {
      ...user,
      ...safeUpdateData,
      updatedAt: new Date(),
    };

    return this.userRepository.save(updatedUser);
  }

  async updateLoginInfo(
    userId: string,
    ipAddress: string,
    deviceInfo: any,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      ipAddress,
      deviceInfo,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
