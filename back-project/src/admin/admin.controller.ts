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
import { AddToBlacklistDto } from './dto/addToBlacklist.dto';
import { UpdateInquiryStatusDto } from './dto/updateInquiryStatus.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserInfoDto } from './dto/allUsers.dto';
import { AddToBlacklistResDto } from './dto/addToBlacklistRes.dto';
import { AdminGuard } from './guards/admin.guard';

interface JwtUser {
  id: number;
  role: UserRole;
}
@ApiTags('관리자 API')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 모든 유저 정보
  @Get('users')
  @ApiOperation({ summary: '모든 유저 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 유저 목록 반환',
    type: UserInfoDto,
  })
  async getUsers(@Req() req: Request) {
    const user = req.user as JwtUser;
    const users = await this.adminService.getAllUsers(user);
    return { ok: true, users };
  }

  // 블랙리스트에 추가
  @Post('blacklist/:userId')
  @ApiOperation({ summary: '유저를 블랙리스트에 추가' })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: '블랙리스트에 등록할 유저 ID',
  })
  @ApiBody({ type: AddToBlacklistDto })
  @ApiResponse({
    status: 201,
    description: '블랙리스트 등록 성공',
    type: AddToBlacklistResDto,
  })
  async addToBlacklist(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: AddToBlacklistDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtUser;
    await this.adminService.addToBlacklist(userId, body.reason, user);
    return { ok: true, targetUserId: userId };
  }

  // 모든 블랙리스트 조회
  @Get('blacklist')
  @ApiOperation({ summary: '블랙리스트 전체 조회' })
  async getBlacklists(@Req() req: Request) {
    const user = req.user as JwtUser;
    const blacklists = await this.adminService.getAllBlacklist(user);
    return { ok: true, blacklists };
  }

  // 블랙리스트 -> 유저
  @Delete('blacklist/:userId')
  @ApiOperation({ summary: '블랙리스트에서 일반 유저로 변경' })
  @ApiParam({ name: 'userId', type: Number })
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
  @ApiOperation({ summary: '유저 삭제 (강제 탈퇴)' })
  @ApiParam({ name: 'id', type: Number })
  async deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as JwtUser;
    await this.adminService.deleteUserAsAdmin(id, user);
    return { ok: true };
  }

  // 모든 신고 내역
  @Get('reports')
  @ApiOperation({ summary: '전체 신고 내역 조회' })
  async getReports(@Req() req: Request) {
    const user = req.user as JwtUser;
    const reports = await this.adminService.getAllReports(user);
    return { ok: true, reports };
  }

  // 게시글 개수
  @Get('postsCount')
  @ApiOperation({ summary: '전체 게시글 개수' })
  async getCountAllPosts(@Req() req: Request) {
    const user = req.user as JwtUser;
    const count = await this.adminService.countAllPosts(user);
    return { ok: true, count };
  }

  // 게시글 삭제
  @Delete('posts/:postId')
  @ApiOperation({ summary: '신고된 게시글 삭제' })
  @ApiParam({ name: 'postId', type: Number })
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
  @ApiOperation({ summary: '신고된 댓글 삭제' })
  @ApiParam({ name: 'commentId', type: Number })
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
  @ApiOperation({ summary: '전체 문의 내역 조회' })
  async getInquiries(@Req() req: Request) {
    const user = req.user as JwtUser;
    const inquiries = await this.adminService.getAllInquiries(user);
    return { ok: true, inquiries };
  }

  // 문의 상태 수정
  @Patch('inquiries/:id/status')
  @ApiOperation({ summary: '문의 상태 수정' })
  @ApiParam({ name: 'id', type: Number })
  async updateInquiryStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateInquiryStatusDto,
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
  @ApiOperation({ summary: '문의 삭제' })
  @ApiParam({ name: 'id', type: Number })
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
  @ApiOperation({ summary: '통계 정보 조회 (채팅/결제/게시글)' })
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
  @ApiOperation({ summary: '전체 결제 내역 조회' })
  async getPayments(@Req() req: Request) {
    const user = req.user as JwtUser;
    const payments = await this.adminService.getAllPayments(user);
    return { ok: true, payments };
  }
}
