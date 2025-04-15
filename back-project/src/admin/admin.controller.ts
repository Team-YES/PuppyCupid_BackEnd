import {
  Controller,
  Get,
  Delete,
  Param,
  Patch,
  Body,
  Post,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { InquiryStatus } from 'src/inquiries/inquiries.entity';
import { UserRole } from 'src/users/users.entity';
interface JwtUser {
  id: number;
  role: UserRole;
}

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 모든 유저 정보
  @Get('users')
  async getUsers(@Req() req: Request) {
    const user = req.user as JwtUser;
    const users = await this.adminService.getAllUsers(user);
    return { ok: true, users };
  }

  // 블랙리스트에 추가
  @Post('blacklist/:userId')
  async addToBlacklist(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { reason: string },
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    await this.adminService.addToBlacklist(userId, body.reason, user);
    return { ok: true };
  }

  // 모든 블랙리스트 조회
  @Get('blacklist')
  async getBlacklists(@Req() req: Request) {
    const user = req.user as JwtUser;
    const blacklists = await this.adminService.getAllBlacklist(user);
    return { ok: true, blacklists };
  }

  // 블랙리스트 -> 유저
  @Delete('blacklist/:userId')
  async removeBlacklist(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    await this.adminService.removeToBlacklist(userId, user);
    return { ok: true };
  }

  // 유저 삭제
  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as JwtUser;
    await this.adminService.deleteUserAsAdmin(id, user);
    return { ok: true };
  }

  // 모든 신고 내역
  @Get('reports')
  async getReports(@Req() req: Request) {
    const user = req.user as JwtUser;
    const reports = await this.adminService.getAllReports(user);
    return { ok: true, reports };
  }

  // 게시글 개수
  @Get('postsCount')
  async getCountAllPosts(@Req() req: Request) {
    const user = req.user as JwtUser;
    const count = await this.adminService.countAllPosts(user);
    return { ok: true, count };
  }

  // 게시글 삭제
  @Delete('posts/:postId')
  async deletePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    await this.adminService.deleteReportPost(postId, user);
    return { ok: true };
  }

  // 댓글 삭제
  @Delete('comments/:commentId')
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    await this.adminService.deleteReportComment(commentId, user);
    return { ok: true };
  }

  // 모든 문의 내역
  @Get('inquiries')
  async getInquiries(@Req() req: Request) {
    const user = req.user as JwtUser;
    const inquiries = await this.adminService.getAllInquiries(user);
    return { ok: true, inquiries };
  }

  // 문의 상태 수정
  @Patch('inquiries/:id/status')
  async updateInquiryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: InquiryStatus },
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    const updated = await this.adminService.updateInquiryStatus(
      id,
      body.status,
      user,
    );
    return { ok: true, updated };
  }

  // 문의 삭제
  @Delete('inquiries/:id')
  async deleteInquiry(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    const result = await this.adminService.deleteInquiry(id, user);
    return { ok: true, result };
  }

  // 채팅방 수 + 결제 내역 수 + 게시글 수
  @Get('count')
  async getChatCount(@Req() req: Request) {
    const user = req.user as JwtUser;

    const chatsCount = (await this.adminService.getChatCount(user)) ?? 0;
    const paymentsCount = (await this.adminService.getPaymentsCount(user)) ?? 0;
    const postsCount = (await this.adminService.countAllPosts(user)) ?? 0;

    const today = new Date().toISOString().split('T')[0];

    return { date: today, chatsCount, paymentsCount, postsCount };
  }

  // 결제 내역
  @Get('payments')
  async getPayments(@Req() req: Request) {
    const user = req.user as JwtUser;
    const payments = await this.adminService.getAllPayments(user);
    return { ok: true, payments };
  }
}
