import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payments.entity';
import { PaymentMethod, PaymentStatus } from './payments.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly userService: UsersService,
  ) {}

  async createPayment(userId: number, amount: number, method: PaymentMethod) {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      throw new Error('User 정보가 없습니다.');
    }

    const payment = this.paymentRepository.create({
      user,
      amount,
      payment_method: method,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(
    orderId: number,
    status: PaymentStatus,
    tossorderId: string,
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { id: orderId },
    });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    payment.toss_payment_id = tossorderId;

    return this.paymentRepository.save(payment);
  }

  async getPaymentByUser(userId: number) {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }
}
