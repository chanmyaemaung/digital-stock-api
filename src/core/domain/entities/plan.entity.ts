import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import type { Subscription } from './subscription.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('plans')
export class Plan {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the plan',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Basic Plan',
    description: 'The name of the plan',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 5.0,
    description: 'The price of the plan',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    example: 500,
    description: 'Daily request limit for the plan',
  })
  @Column()
  requestLimit: number;

  @ApiProperty({
    example: { apis: ['basic', 'premium'] },
    description: 'Features included in the plan',
  })
  @Column('jsonb')
  features: { apis: string[] };

  @ApiProperty({
    example: true,
    description: 'Whether the plan is currently active',
  })
  @Column()
  isActive: boolean;

  @OneToMany('Subscription', 'plan')
  subscriptions: Subscription[];

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Plan creation timestamp',
  })
  @Column()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Plan last update timestamp',
  })
  @Column()
  updatedAt: Date;

  // Domain methods
  public updatePrice(newPrice: number): void {
    this.price = newPrice;
    this.updatedAt = new Date();
  }

  public updateRequestLimit(newLimit: number): void {
    this.requestLimit = newLimit;
    this.updatedAt = new Date();
  }
}
