import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Plan ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  planId: string;

  @ApiProperty({
    description: 'Subscription duration in days',
    example: 30,
    default: 30,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  duration?: number = 30;
}
