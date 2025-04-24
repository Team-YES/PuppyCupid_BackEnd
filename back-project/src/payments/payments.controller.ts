import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentStatus } from './payments.entity';
import { AuthGuard } from '@nestjs/passport';
import {
  CreatePaymentDto,
  PaymentSuccessDto,
  PaymentFailDto,
} from './dto/payment.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('결제')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentService: PaymentsService) {}

  @Get('getTossClientKey')
  @ApiOperation({
    summary: 'Toss Client Key 조회',
    description:
      '프론트에서 결제를 요청할 때 사용하는 Toss Client Key를 반환합니다.',
  })
  @ApiOkResponse({ description: 'Toss Client Key 반환' })
  getTossClientKey() {
    console.log(
      'TOSS_CLIENT_KEY:asdfjlasjkdflakjsdflkajsdflk',
      process.env.TOSS_CLIENT_KEY,
    );
    return { tossClientKey: process.env.TOSS_CLIENT_KEY };
  }

  // 결제
  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '결제 생성',
    description:
      '사용자가 결제를 시작할 때 호출합니다. 결제 금액과 방법을 입력받습니다.',
  })
  @ApiBody({ type: CreatePaymentDto })
  @ApiOkResponse({ description: '결제 생성 후 orderId 반환' })
  @ApiUnauthorizedResponse({ description: 'JWT 인증 필요' })
  async createPayment(@Body() body: CreatePaymentDto, @Req() req: any) {
    const payment = await this.paymentService.createPayment(
      req.user.id,
      body.amount,
      body.method,
    );

    return { orderId: payment.order_id };
  }

  // 결제 성공 처리
  @Post('success')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '결제 성공 처리',
    description:
      'Toss에서 결제 성공 후 호출됩니다. 결제 상태를 SUCCESS로 업데이트하고 유저 권한도 갱신됩니다.',
  })
  @ApiBody({ type: PaymentSuccessDto })
  @ApiOkResponse({ description: '결제 성공 처리 완료' })
  async handlePaymentSuccess(@Body() body: PaymentSuccessDto) {
    try {
      const payment = await this.paymentService.updatePaymentStatus(
        body.orderId,
        PaymentStatus.SUCCESS,
        body.paymentKey,
        body.amount,
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
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: '결제 실패 처리',
    description:
      '결제 실패 시 호출되어 상태를 FAILED로 업데이트하고, 실패 메시지를 저장합니다.',
  })
  @ApiBody({ type: PaymentFailDto })
  @ApiOkResponse({ description: '결제 실패 처리 완료' })
  async handlePaymentFailure(@Body() body: PaymentFailDto) {
    try {
      const payment = await this.paymentService.updatePaymentStatus(
        body.orderId,
        PaymentStatus.FAILED,
        body.errorMessage,
        body.amount,
      );

      return { success: true, message: 'Payment failed, status updated.' };
    } catch (error) {
      return { success: false, message: 'Failed to handle payment failure' };
    }
  }
}
