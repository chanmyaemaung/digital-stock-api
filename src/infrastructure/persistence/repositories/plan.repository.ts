import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from '@app/core/domain/entities/plan.entity';
import { IPlanRepository } from '@app/core/interfaces/repositories/plan.repository.interface';

@Injectable()
export class PlanRepository implements IPlanRepository {
  constructor(
    @InjectRepository(Plan)
    private readonly repository: Repository<Plan>,
  ) {}

  async findById(id: string): Promise<Plan | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Plan[]> {
    return this.repository.find();
  }

  async findActive(): Promise<Plan[]> {
    return this.repository.find({ where: { isActive: true } });
  }

  async create(planData: Partial<Plan>): Promise<Plan> {
    const plan = this.repository.create(planData);
    return this.repository.save(plan);
  }

  async update(id: string, data: Partial<Plan>): Promise<Plan> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
