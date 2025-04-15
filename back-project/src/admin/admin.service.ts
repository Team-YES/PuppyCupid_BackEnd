import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { ReportsService } from 'src/report/report.service';
import { InquiriesService } from 'src/inquiries/inquiries.service';
import { UserRole } from 'src/users/users.entity';
import { InquiryStatus } from 'src/inquiries/inquiries.entity';
import { PaymentsService } from 'src/payments/payments.service';
import { PostsService } from 'src/posts/posts.service';
import { InteractionsService } from 'src/interactions/interactions.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Blacklist } from './blacklist.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,

    private readonly usersService: UsersService,
    private readonly reportsService: ReportsService,
    private readonly inquiriesService: InquiriesService,
    private readonly paymentsService: PaymentsService,
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
  ) {}

  // 유저 목록 전체 조회
  async getAllUsers() {
    return await this.usersService.findAllUser();
  }

  // 블랙리스트에 넣기
  async addToBlacklist(userId: number, reason: string): Promise<void> {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    user.role = UserRole.BLACKLIST;
    await this.usersService.save(user);

    const blacklist = this.blacklistRepository.create({
      targetUser: user,
      reason,
    });

    await this.blacklistRepository.save(blacklist);
  }

  // 블랙리스트 전체 조회
  async getAllBlacklist() {
    return await this.blacklistRepository.find();
  }

  // 블랙리스트 -> 유저로
  async removeToBlacklist(userId: number): Promise<void> {
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    const blacklist = await this.blacklistRepository.findOne({
      where: { targetUser: { id: userId } },
      relations: ['targetUser'],
    });

    if (!blacklist)
      throw new NotFoundException('블랙리스트에 존재하지 않습니다');

    await this.blacklistRepository.remove(blacklist);

    user.role = UserRole.USER;
    await this.usersService.save(user);
  }

  // 유저 삭제 (강제 탈퇴)
  async deleteUserAsAdmin(userId: number) {
    return await this.usersService.deleteUser({
      targetUserId: userId,
      requester: { id: 0, role: UserRole.USER },
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
  async deleteReportComment(commentId: number): Promise<{ ok: boolean }> {
    return await this.interactionsService.deleteComment(commentId, {
      id: 0,
      role: UserRole.USER,
    });
  }

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
