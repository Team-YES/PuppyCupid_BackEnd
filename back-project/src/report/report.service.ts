import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, report_type } from './report.entity';
import { Post } from 'src/posts/posts.entity';
import { Comment } from 'src/interactions/comments.entity';
import { User } from 'src/users/users.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  // 신고
  async createReport(
    reporterId: number,
    reportType: report_type,
    targetId: number,
    reason: string,
  ): Promise<Report> {
    const reporter = await this.userRepository.findOneBy({ id: reporterId });
    if (!reporter) throw new Error('유효하지 않은 신고자입니다.');

    const report = this.reportRepository.create({
      reporter,
      reportType,
      targetId,
      reason,
    });
    await this.reportRepository.save(report);
    return report;
  }

  // 모든 신고 내역 확인
  async getAllReports(): Promise<any[]> {
    const reports = await this.reportRepository.find({
      relations: ['reporter'],
      order: { created_at: 'DESC' },
    });

    const reportInfo = await Promise.all(
      reports.map(async (report) => {
        let targetInfo: {
          userId: number;
          postId?: number;
          commentId?: number;
          nickName?: string | null;
          email?: string;
          content?: string;
        } | null = null;

        if (report.reportType === 'user') {
          const user = await this.userRepository.findOne({
            where: { id: report.targetId },
          });
          if (user) {
            targetInfo = {
              userId: user.id,
              nickName: user.nickName,
              email: user.email,
            };
          }
        }

        if (report.reportType === 'post') {
          const post = await this.postRepository.findOne({
            where: { id: report.targetId },
            relations: ['user'],
          });
          if (post) {
            targetInfo = {
              userId: post.user?.id,
              postId: post.id,
              content: post.content,
              nickName: post.user?.nickName || null,
              email: post.user?.email,
            };
          }
        }

        if (report.reportType === 'comment') {
          const comment = await this.commentRepository.findOne({
            where: { id: report.targetId },
            relations: ['user'],
          });
          if (comment) {
            targetInfo = {
              userId: comment.user?.id,
              commentId: comment.id,
              content: comment.content,
              nickName: comment.user?.nickName || null,
              email: comment.user?.email,
            };
          }
        }

        return {
          id: report.id,
          reportType: report.reportType,
          reason: report.reason,
          created_at: report.created_at,
          reporter: {
            id: report.reporter.id,
            email: report.reporter.email,
            nickName: report.reporter.nickName,
          },
          targetInfo,
        };
      }),
    );

    return reportInfo;
  }

  // 게시글 신고 내역 삭제
  async deletePostReports(postId: number) {
    await this.reportRepository.delete({
      reportType: 'post',
      targetId: postId,
    });
  }

  // 댓글 신고 내역 삭제
  async deleteCommentReports(commentId: number) {
    await this.reportRepository.delete({
      reportType: 'comment',
      targetId: commentId,
    });
  }
}
