import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePlanLimitDto {
  @ApiProperty({
    description: 'The new request limit for the subscription',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  newLimit: number;
}
