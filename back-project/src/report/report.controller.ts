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
import { AuthRequest } from 'src/users/users.controller';

@Controller('report')
@UseGuards(AuthGuard('jwt'))
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':type/:targetId')
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
  async getAllReports() {
    const reports = await this.reportsService.getAllReports();
    return { ok: true, reports };
  }
}
