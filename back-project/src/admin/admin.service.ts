import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ReportsService } from 'src/report/report.service';
import { InquiriesService } from 'src/inquiries/inquiries.service';
import { UserRole } from 'src/users/users.entity';
import { InquiryStatus } from 'src/inquiries/inquiries.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { PostsService } from 'src/posts/posts.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly reportsService: ReportsService,
    private readonly inquiriesService: InquiriesService,
    private readonly paymentsService: PaymentsService,
    private readonly postsService: PostsService,
  ) {}

  // 유저 목록 전체 조회
  async getAllUsers() {
    return await this.usersService.findAllUser();
  }

  // 유저 삭제 (강제 탈퇴)
  async deleteUserAsAdmin(userId: number) {
    return await this.usersService.deleteUser({
      targetUserId: userId,
      requester: { id: 0, role: UserRole.ADMIN },
    });
  }

  // 전체 신고 내역
  async getAllReports() {
    return await this.reportsService.getAllReports();
  }

  // 게시글 개수
  async countAllPosts() {
    return await this.postsService.countAllPosts();
  }

  // 게시글 삭제
  async deleteReportPost(postId: number): Promise<boolean> {
    return await this.postsService.deletePost({
      postId,
      user: { id: 0, role: UserRole.USER },
    });
  }

  // 댓글 삭제

  // 전체 문의 목록
  async getAllInquiries() {
    return await this.inquiriesService.findAllInquiries();
  }

  // 문의 상태 업데이트
  async updateInquiryStatus(id: number, status: InquiryStatus) {
    return await this.inquiriesService.updateStatus(id, status);
  }

  // 문의 삭제
  async deleteInquiry(id: number) {
    return await this.inquiriesService.remove(id);
  }

  // 결제 내역
  async getAllPayments() {
    return await this.paymentsService.allPayments();
  }
}
