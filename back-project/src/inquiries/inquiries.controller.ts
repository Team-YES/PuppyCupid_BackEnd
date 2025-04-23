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

import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateInquiryDto, UpdateInquiryStatusDto } from './dto/inquiry.dto';

@ApiTags('문의')
@Controller('inquiries')
@UseGuards(AuthGuard('jwt'))
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post('contact')
  @ApiOperation({
    summary: '문의 등록',
    description: '문의 정보를 등록합니다.',
  })
  @ApiBody({ type: CreateInquiryDto })
  async createInquiry(@Req() req: Request, @Body() body: CreateInquiryDto) {
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

  @Get()
  @ApiOperation({
    summary: '문의 전체 조회',
    description: '모든 문의를 조회합니다.',
  })
  async getAllInquiries() {
    const inquiries = await this.inquiriesService.findAllInquiries();
    return { ok: true, inquiries };
  }

  @Get(':id')
  @ApiOperation({
    summary: '문의 상세 조회',
    description: '특정 문의 내용을 조회합니다.',
  })
  async getInquiry(@Param('id', ParseIntPipe) id: number) {
    const inquiry = await this.inquiriesService.findInquiryById(id);
    return { ok: true, inquiry };
  }

  @Put(':id/status')
  @ApiOperation({
    summary: '문의 상태 변경',
    description: '문의 상태를 변경합니다.',
  })
  @ApiParam({ name: 'id', type: Number, description: '문의 ID' })
  @ApiBody({ type: UpdateInquiryStatusDto })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateInquiryStatusDto,
  ) {
    const updated = await this.inquiriesService.updateStatus(id, body.status);
    return { ok: true, inquiry: updated };
  }

  @Delete(':id')
  @ApiOperation({
    summary: '문의 삭제',
    description: '특정 문의를 삭제합니다.',
  })
  @ApiParam({ name: 'id', type: Number, description: '문의 ID' })
  async deleteInquiry(@Param('id', ParseIntPipe) id: number) {
    await this.inquiriesService.remove(id);
    return { ok: true, message: '삭제 완료' };
  }
}
