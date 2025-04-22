import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './likes.entity';
import { Post } from 'src/posts/posts.entity';
import { PostsService } from 'src/posts/posts.service';
import { Comment } from './comments.entity';
import { UserRole } from 'src/users/users.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async updateLikeCount(postId: number): Promise<void> {
    const count = await this.likeRepository.count({
      where: { post: { id: postId } },
    });

    await this.postsService.updateLikeCount(postId, count);
  }

  // 좋아요 토글
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

    const post = await this.postsService.findPostById(postId);

    if (post && post.user.id !== userId) {
      const userNickName = await this.usersService.getUserNickName(userId);

      await this.notificationsService.createNotification(
        post.user.id,
        `${userNickName}님이 회원님의 게시글을 좋아합니다.`,
        userId,
      );
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

  // userId로 좋아요한 게시물
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
      relations: [
        'post',
        'post.images',
        'post.likes',
        'post.user',
        'post.user.dogs',
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const items = likes
      .map((like) => like.post)
      .filter((post): post is Post => post !== null && post !== undefined);

    return { items, totalCount };
  }

  // 댓글 작성하기
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
      relations: ['user', 'user.dogs', 'post', 'post.user', 'parentComment'],
    });

    if (!fullComment || !fullComment.user || !fullComment.post) {
      throw new Error('댓글 조회 실패: 필요한 관계 데이터가 없습니다.');
    }

    if (fullComment.user.id !== fullComment.post.user.id) {
      await this.notificationsService.createNotification(
        fullComment.post.user.id,
        `${fullComment.user.nickName}님이 회원님의 게시글에 댓글을 남겼습니다.`,
        fullComment.user.id,
      );
    }

    return {
      id: fullComment.id,
      content: fullComment.content,
      created_at: fullComment.created_at,
      postId: fullComment.post.id,
      user: {
        id: fullComment.user.id,
        nickName: fullComment.user.nickName,
        dogImage: fullComment.user.dogs?.[0]?.dog_image ?? null,
      },
      parentCommentId: fullComment.parentComment?.id ?? null,
    };
  }

  // 게시글 당 댓글
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

  // 게시글 당 좋아요 수
  async countLikesByPostId(postId: number): Promise<number> {
    return this.likeRepository.count({
      where: { post: { id: postId } },
    });
  }

  // 댓글 수
  async countCommentsByPostId(postId: number): Promise<number> {
    return this.commentRepository.count({
      where: { post: { id: postId } },
    });
  }

  // 댓글 삭제
  async deleteComment(
    commentId: number,
    user: { id: number; role: UserRole },
  ): Promise<{ ok: boolean }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new Error('댓글을 찾을 수 없습니다.');
    }

    const author = comment.user.id === user.id;
    const admin = user.role === UserRole.ADMIN;

    if (!author && !admin) {
      throw new Error('삭제 권한이 없습니다.');
    }

    await this.commentRepository.remove(comment);
    return { ok: true };
  }
}
