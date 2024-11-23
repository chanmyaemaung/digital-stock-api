import { User } from '@app/core/domain/entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findByEmailOrPhone(email: string, phone: string): Promise<User | null>;
  find(options?: { skip?: number; take?: number }): Promise<User[]>;
  count(): Promise<number>;
  create(user: Partial<User>): Promise<User>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
  getUserGrowth(
    startDate: Date,
  ): Promise<Array<{ date: string; count: number }>>;
}
