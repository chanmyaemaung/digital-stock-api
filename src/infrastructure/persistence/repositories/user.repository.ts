import { User } from '@app/core/domain/entities/user.entity';
import { IUserRepository } from '@app/core/interfaces/repositories/user.repository.interface';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async find(options?: { skip?: number; take?: number }): Promise<User[]> {
    return this.repository.find({
      skip: options?.skip,
      take: options?.take,
      order: { createdAt: 'DESC' },
    });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.repository.findOne({ where: { phone } });
  }

  async findByEmailOrPhone(email: string, phone: string): Promise<User | null> {
    return this.repository.findOne({
      where: [{ email }, { phone }],
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getUserGrowth(
    startDate: Date,
  ): Promise<Array<{ date: string; count: number }>> {
    const users = await this.repository.find({
      where: {
        createdAt: Between(startDate, new Date()),
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const dailyGrowth = users.reduce((acc, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailyGrowth).map(([date, count]) => ({
      date,
      count: count as number,
    }));
  }
}
