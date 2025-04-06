import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './likes.entity';
import { Post } from '../posts/posts.entity';
import { PostsService } from 'src/posts/posts.service';
import { Comment } from './comments.entity';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly postsService: PostsService,
  ) {}

  private async updateLikeCount(postId: number): Promise<void> {
    const count = await this.likeRepository.count({
      where: { post: { id: postId } },
    });

    await this.postsService.updateLikeCount(postId, count);
  }

  async toggleLike(
    userId: number,
    postId: number,
  ): Promise<{ liked: boolean; likeCount: number }> {
    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: userId },
        post: { id: postId },
      },
    });

    let liked: boolean;

    if (existingLike) {
      await this.likeRepository.remove(existingLike);
      liked = false;
    } else {
      const newLike = this.likeRepository.create({
        user: { id: userId },
        post: { id: postId },
      });
      await this.likeRepository.save(newLike);
      liked = true;
    }

    const likeCount = await this.likeRepository.count({
      where: { post: { id: postId } },
    });

    await this.postsService.updateLikeCount(postId, likeCount);

    return {
      liked,
      likeCount,
    };
  }

  async findLikedPostsByUser(userId: number): Promise<Post[]> {
    const likes = await this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
    });

    return likes.map((like) => like.post);
  }

  async createComment(
    userId: number,
    postId: number,
    content: string,
    parentCommentId?: number,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      user: { id: userId },
      post: { id: postId },
      content,
      parentComment: parentCommentId ? { id: parentCommentId } : undefined,
    });

    return await this.commentRepository.save(comment);
  }

  async getCommentsByPost(postId: number): Promise<any[]> {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'user.dogs', 'parentComment'], // ✅ dogs도 포함
      order: { created_at: 'ASC' },
    });

    return comments.map((comment) => {
      const dogs = comment.user?.dogs || [];
      const dogImage = dogs.length > 0 ? dogs[0].dog_image : null; // ✅ 첫 번째 강아지의 이미지 사용

      return {
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          id: comment.user.id,
          nickName: comment.user.nickName,
          dogImage,
        },
        parentCommentId: comment.parentComment?.id || null,
      };
    });
  }

  async deleteComment(
    commentId: number,
    userId: number,
  ): Promise<{ ok: boolean }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    if (comment.user.id !== userId) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await this.commentRepository.remove(comment);
    return { ok: true };
  }
}
