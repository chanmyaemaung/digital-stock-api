import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class UpdatePlanLimitDto {
  @ApiProperty({
    example: 1000,
    description: 'New daily request limit',
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  requestLimit: number;
}
