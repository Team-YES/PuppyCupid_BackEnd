import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
} from '@nestjs/common';
import { ReportsService } from './report.service';
import { AuthGuard } from '@nestjs/passport';
import { report_type } from './report.entity';
import { AuthRequest } from '@/users/users.controller';

import { ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateReportDto } from './dto/createReport.dto';
@ApiTags('신고')
@Controller('report')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':type/:targetId')
  @ApiOperation({
    summary: '신고하기',
    description: '게시글, 댓글, 유저에 대한 신고를 생성합니다.',
  })
  @ApiParam({ name: 'type', enum: report_type, example: 'comment' })
  @ApiParam({ name: 'targetId', example: 1 })
  @ApiBody({ type: CreateReportDto })
  async reportContent(
    @Req() req: AuthRequest,
    @Param('type') type: report_type,
    @Param('targetId') targetId: string,
    @Body() body: { reason: string },
  ) {
    const user = req.user;

    const report = await this.reportsService.createReport(
      user.id,
      type,
      Number(targetId),
      body.reason,
    );
    return { ok: true, report };
  }

  @Get()
  @ApiOperation({ summary: '모든 신고 목록 조회 (관리자용)' })
  async getAllReports() {
    const reports = await this.reportsService.getAllReports();
    return { ok: true, reports };
  }
}
