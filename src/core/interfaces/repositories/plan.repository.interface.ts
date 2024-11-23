import { Plan } from '@app/core/domain/entities/plan.entity';

export interface IPlanRepository {
  findById(id: string): Promise<Plan | null>;
  findAll(): Promise<Plan[]>;
  findActive(): Promise<Plan[]>;
  create(plan: Partial<Plan>): Promise<Plan>;
  update(id: string, data: Partial<Plan>): Promise<Plan>;
  delete(id: string): Promise<void>;
}
