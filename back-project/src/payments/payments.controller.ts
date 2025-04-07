import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentMethod, PaymentStatus } from './payments.entity';
import axios from 'axios';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get('getTossClientKey')
  getTossClientKey() {
    return { tossClientKey: process.env.TOSS_CLIENT_KEY };
  }

  // 결제
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  async createPayment(
    @Body('amount') amount: number,
    @Body('method') method: PaymentMethod,
    @Req() req: any,
  ) {
    const payment = await this.paymentService.createPayment(
      req.user.id,
      amount,
      method,
    );

    return { orderId: payment.order_id };
  }

  // 결제 성공 처리
  @Post('success')
  async handlePaymentSuccess(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('paymentKey') paymentKey: string,
  ) {
    try {
      const payment = await this.paymentService.updatePaymentStatus(
        orderId,
        PaymentStatus.SUCCESS,
        paymentKey,
        amount,
      );

      return { success: true, message: 'Payment marked as successful' };
    } catch (error) {
      console.error('결제 성공 처리 실패:', error);
      return {
        success: false,
        message: 'Failed to mark payment as successful',
      };
    }
  }

  // 결제 실패 처리
  @Post('fail')
  async handlePaymentFailure(
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('errorCode') errorCode: string,
    @Body('errorMessage') errorMessage: string,
  ) {
    try {
      // 결제 상태를 실패로 업데이트
      const payment = await this.paymentService.updatePaymentStatus(
        orderId,
        PaymentStatus.FAILED,
        errorMessage,
        amount,
      );

      return { success: true, message: 'Payment failed, status updated.' };
    } catch (error) {
      return { success: false, message: 'Failed to handle payment failure' };
    }
  }
}
