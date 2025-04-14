import { Controller, Get, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('match')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatch(@Query('rejected') rejected: string) {
    const userId = 19;

    let parsedRejected: { mbti: string; personality: string[] }[] = [];
    try {
      parsedRejected = rejected ? JSON.parse(rejected) : [];
    } catch (err) {
      return { ok: false, error: 'rejected 파라미터 형식이 잘못되었습니다.' };
    }

    try {
      const match = await this.matchesService.recommend(userId, parsedRejected);
      return { ok: true, match };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}
