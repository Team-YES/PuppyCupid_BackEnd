import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { AuthGuard } from '@nestjs/passport';

interface MatchRequest {
  fromDogId: number;
  toDogId: number;
}

@Controller('matches')
@UseGuards(AuthGuard('jwt'))
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post('request')
  async requestMatch(@Body() body: MatchRequest) {
    const { fromDogId, toDogId } = body;
    return await this.matchesService.requestMatch(fromDogId, toDogId);
  }
  @Post(':matchId/respond')
  async respondMatch(
    @Param('matchId') matchId: number,
    @Body('action') action: 'accept' | 'reject',
  ) {
    return await this.matchesService.respondToMatch(matchId, action);
  }

  @Get('mine/:dogId')
  async getMyMatches(@Param('dogId') dogId: number) {
    return await this.matchesService.getMyMatches(dogId);
  }
}
