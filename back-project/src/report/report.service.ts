import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, report_type } from './report.entity';
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

  async getAllReports(): Promise<Report[]> {
    return this.reportRepository.find({
      relations: ['reporter'],
      order: { created_at: 'DESC' },
    });
  }
}
