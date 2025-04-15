import {
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Body,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
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

  // 블랙리스트에 추가
  @Post('blacklist/:userId')
  async addToBlacklist(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { reason: string },
  ) {
    await this.adminService.addToBlacklist(userId, body.reason);
    return { ok: true };
  }

  // 모든 블랙리스트 조회
  @Get('blacklist')
  async getBlacklists() {
    const blacklists = await this.adminService.getAllBlacklist();
    return { ok: true, blacklists };
  }

  // 블랙리스트 -> 유저
  @Delete('blacklist/:userId')
  async removeBlacklist(@Param('userId', ParseIntPipe) userId: number) {
    await this.adminService.removeToBlacklist(userId);
    return { ok: true };
  }

  // 유저 삭제
  @Delete('users/:id')
  async deleteUser(@Param('id') id: number) {
    const user = await this.adminService.deleteUserAsAdmin(id);
    return { ok: true };
  }

  // 모든 신고 내역
  @Get('reports')
  async getReports() {
    const reports = await this.adminService.getAllReports();
    return { ok: true, reports };
  }

  // 모든 게시글 개수
  @Get('postsCount')
  async getCountAllPosts() {
    const count = await this.adminService.countAllPosts();
    return { ok: true, count };
  }

  // 게시글 삭제
  @Delete('posts/:postId')
  async deletePost(@Param('postId') postId: number) {
    const post = await this.adminService.deleteReportPost(postId);
    return { ok: true };
  }

  // 댓글 삭제
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: number) {
    const comment = await this.adminService.deleteReportComment(commentId);
    return { ok: true };
  }

  // 모든 문의 내역
  @Get('inquiries')
  async getInquiries() {
    const inquiries = await this.adminService.getAllInquiries();
    return { ok: true, inquiries };
  }

  // 문의하기 상태
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
