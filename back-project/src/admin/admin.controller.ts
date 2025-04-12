import { Controller, Get, Delete, Param, Patch, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { InquiryStatus } from 'src/inquiries/inquiries.entity';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getUsers() {
    const users = await this.adminService.getAllUsers();
    return { ok: true, users };
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    const user = await this.adminService.deleteUserAsAdmin(id);
    return { ok: true, user };
  }

  @Get('reports')
  async getReports() {
    const reports = await this.adminService.getAllReports();
    return { ok: true, reports };
  }

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

  @Delete('inquiries/:id')
  async deleteInquiry(@Param('id') id: number) {
    const result = await this.adminService.deleteInquiry(id);
    return { ok: true, result };
  }
}
