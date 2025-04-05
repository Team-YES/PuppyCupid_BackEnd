import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Match, MatchStatus } from './matches.entity';
import { Dog } from 'src/dogs/dogs.entity';
import { Repository } from 'typeorm';
@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Dog)
    private dogRepository: Repository<Dog>,
  ) {}

  async requestMatch(dog1Id: number, dog2Id: number): Promise<Match> {
    const existing = await this.matchRepository.findOne({
      where: [
        { dog1: { id: dog1Id }, dog2: { id: dog2Id } },
        { dog1: { id: dog2Id }, dog2: { id: dog1Id } },
      ],
    });

    if (existing) {
      throw new Error('이미 매칭 요청이 존재합니다.');
    }
    const match = this.matchRepository.create({
      dog1: { id: dog1Id } as Dog,
      dog2: { id: dog2Id } as Dog,
      status: MatchStatus.PENDING,
    });
    return await this.matchRepository.save(match);
  }

  async respondToMatch(
    matchId: number,
    action: 'accept' | 'reject',
  ): Promise<Match> {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new Error('매칭 요청이 존재하지 않습니다');
    }

    match.status =
      action === 'accept' ? MatchStatus.ACCEPTED : MatchStatus.REJECTED;
    return await this.matchRepository.save(match);
  }

  async getMyMatches(dogId: number): Promise<Match[]> {
    return await this.matchRepository.find({
      where: [{ dog1: { id: dogId } }, { dog2: { id: dogId } }],
      relations: ['dog1', 'dog2'],
    });
  }
}
