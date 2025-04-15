import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('match')
@UseGuards(AuthGuard('jwt'))
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  async getMatch(
    @Req() req: Request,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('rejected') rejected: string,
  ) {
    const userId = (req as any).user?.id;

    // 위도/경도 필수 확인
    if (!lat || !lng) {
      return { ok: false, error: '위도와 경도를 쿼리로 전달해주세요.' };
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      return { ok: false, error: '위도/경도 형식이 잘못되었습니다.' };
    }

    let parsedRejected: { mbti: string; personality: string[] }[] = [];
    try {
      parsedRejected = rejected ? JSON.parse(rejected) : [];
    } catch (err) {
      return { ok: false, error: 'rejected 파라미터 형식이 잘못되었습니다.' };
    }

    try {
      const match = await this.matchesService.recommend(
        userId,
        latitude,
        longitude,
        parsedRejected,
      );
      return { ok: true, match };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
}
