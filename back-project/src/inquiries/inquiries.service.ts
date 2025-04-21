import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Inquiry, InquiryStatus, InquiryType } from './inquiries.entity';
import { Repository } from 'typeorm';
import { User } from '@/users/users.entity';
@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(Inquiry)
    private readonly inquiryRepository: Repository<Inquiry>,
  ) {}

  async createInquiry(
    user: User,
    body: {
      name: string;
      email: string;
      phone: string;
      type: string;
      content: string;
    },
  ) {
    const inquiry = this.inquiryRepository.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      type: body.type as InquiryType,
      content: body.content,
      user: { id: user.id },
    });

    return await this.inquiryRepository.save(inquiry);
  }

  async findAllInquiries() {
    return await this.inquiryRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findInquiryById(id: number) {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!inquiry) throw new NotFoundException('문의가 존재하지 않습니다.');
    return inquiry;
  }

  async updateStatus(id: number, status: InquiryStatus) {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('문의가 존재하지 않습니다.');
    }
    inquiry.status = status;
    return await this.inquiryRepository.save(inquiry);
  }

  async remove(id: number) {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('문의가 존재하지 않습니다.');
    }
    return await this.inquiryRepository.remove(inquiry);
  }
}
