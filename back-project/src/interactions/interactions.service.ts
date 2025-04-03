import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './likes.entity';
import { Post } from '../posts/posts.entity';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findLikedPostsByUser(userId: number): Promise<Post[]> {
    const likes = await this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
    });

    return likes.map((like) => like.post);
  }
}
