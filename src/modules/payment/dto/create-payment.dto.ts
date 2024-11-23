import { PaymentType } from '@app/core/domain/enums/payment-type.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 100,
    description: 'Payment amount',
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    enum: PaymentType,
    example: PaymentType.STRIPE,
    description: 'Payment type (manual/stripe)',
  })
  @IsEnum(PaymentType)
  type: PaymentType;
}
