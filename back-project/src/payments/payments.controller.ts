import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from './payments.entity';
import axios from 'axios';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get('getTossClientKey')
  getTossClientKey() {
    console.log(process.env.TOSS_CLIENT_KEY, 'asdfsdfsefss');
    return { tossClientKey: process.env.TOSS_CLIENT_KEY };
  }

  // 결제 성공 처리
  @Post('success')
  async handlePaymentSuccess(
    @Body('orderId') orderId: number,
    @Body('amount') amount: number,
    @Body('paymentKey') paymentKey: string,
    // 토스 결제 키
  ) {
    try {
      // 결제 상태 확인
      const response = await axios.post(
        'https://api.tosspayments.com/v1/payments/' + paymentKey,
        null,
        {
          headers: {
            Authorization: `Bearer ${process.env.TOSS_API_KEY}`,
          },
        },
      );

      const paymentData = response.data;

      if (paymentData.status === 'SUCCESS') {
        // 결제 성공 시, 결제 상태 업데이트
        const payment = await this.paymentService.updatePaymentStatus(
          orderId,
          PaymentStatus.SUCCESS,
          paymentData.paymentKey,
        );

        return { success: true, message: 'Payment successful' };
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error.message);
      return { success: false, message: 'Payment failed verification' };
    }
  }

  // 결제 실패 처리
  @Post('fail')
  async handlePaymentFailure(
    @Body('orderId') orderId: number,
    @Body('amount') amount: number,
    @Body('errorCode') errorCode: string,
    @Body('errorMessage') errorMessage: string,
  ) {
    try {
      // 결제 상태를 실패로 업데이트
      const payment = await this.paymentService.updatePaymentStatus(
        orderId,
        PaymentStatus.FAILED,
        errorMessage, // 오류 메시지 저장
      );

      return { success: true, message: 'Payment failed, status updated.' };
    } catch (error) {
      console.error('Failed to update payment status:', error.message);
      return { success: false, message: 'Failed to handle payment failure' };
    }
  }
}
