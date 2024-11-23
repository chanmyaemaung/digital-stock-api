import { IsUUID, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the plan to subscribe to',
  })
  @IsUUID()
  planId: string;

  @ApiProperty({
    example: 30,
    description: 'Duration of subscription in days (30-365)',
    minimum: 30,
    maximum: 365,
  })
  @IsNumber()
  @Min(30)
  @Max(365)
  duration: number;
}
