import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { MatchResponseDto } from './dto/matches.dto';

@ApiTags('Match')
@Controller('match')
@UseGuards(AuthGuard('jwt'))
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @ApiOperation({
    summary: '강아지 추천',
    description:
      '현재 사용자의 강아지 MBTI와 성격을 기반으로 인근에 있는 궁합이 잘 맞는 강아지를 추천합니다.',
  })
  @ApiQuery({ name: 'lat', required: true, description: '현재 위도' })
  @ApiQuery({ name: 'lng', required: true, description: '현재 경도' })
  @ApiQuery({
    name: 'rejected',
    required: false,
    description: '이미 거절한 강아지 조합 목록 (JSON 형식)',
    example: `[{"mbti": "INTJ", "personality": ["고집쟁이", "신중함"]}]`,
  })
  @ApiOkResponse({
    description: '추천된 강아지 정보',
    schema: {
      example: {
        ok: true,
        match: {
          id: 3,
          name: '뽀미',
          mbti: 'ENFP',
          personality: '사교적임, 애교쟁이',
          imageUrl: 'https://example.com/images/ppomi.jpg',
          latitude: 37.5651,
          longitude: 126.9895,
          userId: 45,
        },
      },
    },
  })
  async getMatch(
    @Req() req: Request,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('rejected') rejected: string,
  ) {
    const userId = (req as any).user?.id;

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
