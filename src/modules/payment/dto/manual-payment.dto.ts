import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class ManualPaymentDto {
  @ApiProperty({
    example: 100,
    description: 'Payment amount',
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: 'Bank transfer reference: ABC123',
    description: 'Payment reference or description',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    example: { bankName: 'KBZ', accountNumber: '123456' },
    description: 'Additional payment details',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
