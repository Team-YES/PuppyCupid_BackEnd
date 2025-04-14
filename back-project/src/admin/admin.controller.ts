import { Controller, Get, Delete, Param, Patch, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { InquiryStatus } from 'src/inquiries/inquiries.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 모든 유저 정보
  @Get('users')
  async getUsers() {
    const users = await this.adminService.getAllUsers();
    return { ok: true, users };
  }

  // 유저 삭제
  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    const user = await this.adminService.deleteUserAsAdmin(id);
    return { ok: true, user };
  }

  // 모든 신고 내역
  @Get('reports')
  async getReports() {
    const reports = await this.adminService.getAllReports();
    return { ok: true, reports };
  }

  // 모든 문의 내역
  @Get('inquiries')
  async getInquiries() {
    const inquiries = await this.adminService.getAllInquiries();
    return { ok: true, inquiries };
  }

  @Patch('inquiries/:id/status')
  async updateInquiryStatus(
    @Param('id') id: number,
    @Body() body: { status: InquiryStatus },
  ) {
    const updated = await this.adminService.updateInquiryStatus(
      id,
      body.status,
    );
    return { ok: true, updated };
  }

  // 문의 삭제
  @Delete('inquiries/:id')
  async deleteInquiry(@Param('id') id: number) {
    const result = await this.adminService.deleteInquiry(id);
    return { ok: true, result };
  }

  // 모든 결제 내역
  @Get('payments')
  async getPayments() {
    const payments = await this.adminService.getAllPayments();
    return { ok: true, payments };
  }
}
