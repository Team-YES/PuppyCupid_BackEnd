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

  async findLikedPostsByUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ items: Post[]; totalCount: number }> {
    const totalCount = await this.likeRepository.count({
      where: { user: { id: userId } },
    });

    const likes = await this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const items = likes.map((like) => like.post);

    return { items, totalCount };
  }

  async createComment(
    userId: number,
    postId: number,
    content: string,
    parentCommentId?: number,
  ): Promise<any> {
    const newComment = this.commentRepository.create({
      user: { id: userId },
      post: { id: postId },
      content,
      parentComment: parentCommentId ? { id: parentCommentId } : undefined,
    });

    const savedComment = await this.commentRepository.save(newComment);

    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user', 'user.dogs', 'parentComment'],
    });

    if (!fullComment) {
      throw new Error('댓글 조회 실패');
    }

    const dogs = fullComment.user?.dogs || [];
    const dogImage = dogs.length > 0 ? dogs[0].dog_image : null;

    return {
      id: fullComment.id,
      content: fullComment.content,
      created_at: fullComment.created_at,
      postId: fullComment.post.id,
      user: {
        id: fullComment.user.id,
        nickName: fullComment.user.nickName,
        dogImage,
      },
      parentCommentId: fullComment.parentComment?.id || null,
    };
  }

  async getCommentsByPost(postId: number): Promise<any[]> {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'user.dogs', 'parentComment'],
      order: { created_at: 'ASC' },
    });

    return comments.map((comment) => {
      const dogs = comment.user?.dogs || [];
      const dogImage = dogs.length > 0 ? dogs[0].dog_image : null;

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
