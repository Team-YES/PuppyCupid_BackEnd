import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payments.entity';
import { PaymentMethod, PaymentStatus } from './payments.entity';
import { UsersService } from 'src/users/users.service';
import { UserRole } from 'src/users/users.entity';
import { addMonths, addYears } from 'date-fns';
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly userService: UsersService,
  ) {}

  async createPayment(userId: number, amount: number, method: PaymentMethod) {
    const user = await this.userService.findUserById(userId);
    if (!user) throw new Error('User 정보가 없습니다.');

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = this.paymentRepository.create({
      user,
      amount,
      payment_method: method,
      status: PaymentStatus.SUCCESS,
      order_id: orderId,
    });

    return this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
    tossorderId: string,
    amount: number,
  ) {
    const payment = await this.paymentRepository.findOne({
      where: { order_id: orderId },
      relations: ['user'],
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = status;
    payment.toss_payment_id = tossorderId;

    if (status === PaymentStatus.SUCCESS && amount) {
      if (amount === 2900) {
        payment.user.role = UserRole.POWER_MONTH;
        payment.user.power_expired_at = addMonths(new Date(), 1);
      } else if (amount === 29000) {
        payment.user.role = UserRole.POWER_YEAR;
        payment.user.power_expired_at = addYears(new Date(), 1);
      }

      await this.userService.save(payment.user);
    }

    return this.paymentRepository.save(payment);
  }

  async getPaymentByUser(userId: number) {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }
}
