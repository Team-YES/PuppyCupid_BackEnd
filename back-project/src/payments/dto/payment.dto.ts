import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../payments.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 2900, description: '결제 금액 (예: 2900, 29000)' })
  amount: number;

  @ApiProperty({
    enum: PaymentMethod,
    example: PaymentMethod.CARD,
    description: '결제 수단',
  })
  method: PaymentMethod;
}

export class PaymentSuccessDto {
  @ApiProperty({ example: 'order_1713774940158_123', description: '주문 ID' })
  orderId: string;

  @ApiProperty({ example: 2900, description: '결제 금액' })
  amount: number;

  @ApiProperty({
    example: 'tosspayments_PyV...aKx',
    description: 'Toss 결제 키',
  })
  paymentKey: string;
}

export class PaymentFailDto {
  @ApiProperty({ example: 'order_1713774940158_123', description: '주문 ID' })
  orderId: string;

  @ApiProperty({ example: 2900, description: '결제 금액' })
  amount: number;

  @ApiProperty({ example: 'PAYMENT_FAILED', description: '에러 코드' })
  errorCode: string;

  @ApiProperty({ example: '잔액 부족', description: '에러 메시지' })
  errorMessage: string;
}


