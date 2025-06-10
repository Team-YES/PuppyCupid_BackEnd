import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { MessagesService } from 'src/messages/messages.service';
import { error } from 'console';

interface AdminRequest {
  id: number;
  role: UserRole;
}

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
    private readonly messagesService: MessagesService,
  ) {}

  // 관리자 확인
  private checkAdmin(requester: AdminRequest) {
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('관리자만 접근할 수 있습니다.');
    }
  }

  // 유저 목록 전체 조회
  async getAllUsers(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.usersService.findAllUser();
  }

  // 블랙리스트에 넣기
  async addToBlacklist(
    userId: number,
    reason: string,
    requester: AdminRequest,
  ) {
    this.checkAdmin(requester);

    const user = await this.usersService.findUserById(userId);
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다');

    const existing = await this.blacklistRepository.findOne({
      where: { targetUser: { id: userId } },
    });
    if (existing) {
      throw new BadRequestException('이미 블랙리스트에 등록된 유저입니다');
    }

    user.role = UserRole.BLACKLIST;
    await this.usersService.save(user);

    const blacklist = this.blacklistRepository.create({
      targetUser: user,
      reason,
    });

    await this.blacklistRepository.save(blacklist);
  }

  // 블랙리스트 전체 조회
  async getAllBlacklist(requester: AdminRequest) {
    this.checkAdmin(requester);
    const blacklists = await this.blacklistRepository.find({
      relations: ['targetUser'],
      order: { created_at: 'DESC' },
    });

    return blacklists.map((x) => ({
      id: x.id,
      targetUserId: x.targetUser?.id ?? null,
      reason: x.reason,
      created_at: x.created_at,
    }));
  }

  // 블랙리스트 -> 유저로
  async removeToBlacklist(userId: number, requester: AdminRequest) {
    this.checkAdmin(requester);

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
  async deleteUserAsAdmin(userId: number, requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.usersService.deleteUser({
      targetUserId: userId,
      requester,
    });
  }

  // 전체 신고 내역
  async getAllReports(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.reportsService.getAllReports();
  }

  // 게시글 개수
  async countAllPosts(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.postsService.countAllPosts();
  }

  // 게시글 삭제
  async deleteReportPost(postId: number, requester: AdminRequest) {
    this.checkAdmin(requester);
    await this.reportsService.deletePostReports(postId);
    return this.postsService.deletePost({
      postId,
      user: requester,
    });
  }

  // 댓글 삭제
  async deleteReportComment(commentId: number, requester: AdminRequest) {
    this.checkAdmin(requester);
    await this.reportsService.deleteCommentReports(commentId);
    return this.interactionsService.deleteComment(commentId, requester);
  }

  // 전체 문의 목록
  async getAllInquiries(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.inquiriesService.findAllInquiries();
  }

  // 문의 상태 업데이트
  async updateInquiryStatus(
    id: number,
    status: InquiryStatus,
    requester: AdminRequest,
  ) {
    this.checkAdmin(requester);
    return this.inquiriesService.updateStatus(id, status);
  }

  // 문의 삭제
  async deleteInquiry(id: number, requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.inquiriesService.remove(id);
  }

  // 채팅방 수
  async getChatCount(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.messagesService.countChat();
  }

  // 결제 내역
  async getAllPayments(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.paymentsService.allPayments();
  }

  // 결제 내역 수
  async getPaymentsCount(requester: AdminRequest) {
    this.checkAdmin(requester);
    return this.paymentsService.countPayments();
  }
}
