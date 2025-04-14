import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, report_type } from './report.entity';
import { Post } from 'src/posts/posts.entity';
import { Comment } from 'src/interactions/comments.entity';
import { User } from 'src/users/users.entity';
import { Blacklist } from './blacklist.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,

    @InjectRepository(Blacklist)
    private readonly blacklistRepository: Repository<Blacklist>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

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

    if (reportType === report_type.USER) {
      const reportCount = await this.reportRepository.count({
        where: { reportType, targetId },
      });

      if (reportCount >= 3) {
        const targetUser = await this.userRepository.findOneBy({
          id: targetId,
        });

        if (targetUser) {
          const alreadyBlacklisted = await this.blacklistRepository.findOne({
            where: { targetUser },
          });

          if (!alreadyBlacklisted) {
            const blacklist = this.blacklistRepository.create({
              reporter,
              targetUser,
              targetDog: null,
              reason: '신고 누적 3회',
            });
            await this.blacklistRepository.save(blacklist);
          }
        }
      }
    }

    return report;
  }

  async getAllReports(): Promise<any[]> {
    const reports = await this.reportRepository.find({
      relations: ['reporter'],
      order: { created_at: 'DESC' },
    });

    const reportInfo = await Promise.all(
      reports.map(async (report) => {
        let targetInfo: {
          id: number;
          nickName?: string | null;
          email?: string;
          content?: string;
          writer?: string | null;
        } | null = null;

        if (report.reportType === 'user') {
          const user = await this.userRepository.findOne({
            where: { id: report.targetId },
          });
          if (user) {
            targetInfo = {
              id: user.id,
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
              id: post.id,
              content: post.content,
              nickName: post.user?.nickName || null,
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
              id: comment.id,
              content: comment.content,
              nickName: comment.user?.nickName || null,
            };
          }
        }

        return {
          ...report,
          targetInfo,
        };
      }),
    );

    return reportInfo;
  }
}
