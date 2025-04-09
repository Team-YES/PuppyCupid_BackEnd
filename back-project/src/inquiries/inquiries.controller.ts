import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { AuthGuard } from '@nestjs/passport';
import { InquiryStatus } from './inquiries.entity';
import { Request } from 'express';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('contact')
  async createInquiry(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;

    const { name, email, phone, type, content } = body;

    if (!name || !email || !phone || !type || !content) {
      return {
        ok: false,
        error: '모든 필드를 입력해주세요.',
      };
    }

    const inquiry = await this.inquiriesService.createInquiry(user, {
      name,
      email,
      phone,
      type,
      content,
    });

    return { ok: true, inquiry };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getAllInquiries() {
    const inquiries = await this.inquiriesService.findAllInquiries();
    return { ok: true, inquiries };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getInquiry(@Param('id', ParseIntPipe) id: number) {
    const inquiry = await this.inquiriesService.findInquiryById(id);
    return { ok: true, inquiry };
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: InquiryStatus,
  ) {
    const updated = await this.inquiriesService.updateStatus(id, status);
    return { ok: true, inquiry: updated };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteInquiry(@Param('id', ParseIntPipe) id: number) {
    await this.inquiriesService.remove(id);
    return { ok: true, message: '삭제 완료' };
  }
}
