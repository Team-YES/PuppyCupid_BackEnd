import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ReportsService } from './report.service';
import { AuthGuard } from '@nestjs/passport';
import { report_type } from './report.entity';
import { AuthRequest } from 'src/users/users.controller';

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async reportContent(
    @Req() req: AuthRequest,
    @Body()
    body: {
      reportType: report_type;
      targetId: number;
      reason: string;
    },
  ) {
    const user = req.user;

    const { reportType, targetId, reason } = body;

    const report = await this.reportsService.createReport(
      user.id,
      reportType,
      targetId,
      reason,
    );
    return { ok: true, report };
  }

  @Get()
  async getAllReports() {
    const reports = await this.reportsService.getAllReports();
    return { ok: true, reports };
  }
}
