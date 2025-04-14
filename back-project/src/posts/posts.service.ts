import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './posts.entity';
import { PostImage } from './post_images.entity';
import { UserRole } from 'src/users/users.entity';
import { PostCategory } from './posts.entity';
import { Like as LikeEntity } from 'src/interactions/likes.entity';

import { Like } from 'typeorm';
import { Comment } from 'src/interactions/comments.entity';
import { InteractionsService } from 'src/interactions/interactions.service';

const like = new LikeEntity();
export interface CreatePostInput {
  user: {
    id: number;
    role: UserRole;
  };
  category: PostCategory;
  content: string;
  mainImageUrl: string;
  imageUrls: string[];
}

export interface UpdatePostInput {
  postId: number;
  content: string;
}

export interface DeletePostInput {
  postId: number;
  user: {
    id: number;
    role: UserRole;
  };
}
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    private readonly interactionsService: InteractionsService,
  ) {}

  // id로 게시글 찾기
  async findPostById(postId: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user', 'images', 'likes', 'likes.user'],
    });

    if (!post) {
      throw new Error('해당 게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  // 게시글 작성하기
  async createPost(input: CreatePostInput): Promise<Post> {
    const { user, category, content, mainImageUrl, imageUrls } = input;

    const post = this.postRepository.create({
      user,
      category,
      content,
      main_image_url: mainImageUrl,
      images: imageUrls.map((url, idx) => {
        const image = new PostImage();
        image.image_url = url;
        image.order = idx;
        return image;
      }),
    });

    return await this.postRepository.save(post);
  }

  // 게시글 수정하기
  async updatePost(input: UpdatePostInput): Promise<Post> {
    const { postId, content } = input;

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    post.content = content;

    return await this.postRepository.save(post);
  }

  // 게시글 삭제하기
  async deletePost(input: DeletePostInput): Promise<boolean> {
    const { postId, user } = input;

    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    const author = post.user.id === user.id;
    const admin = user.role === UserRole.ADMIN;

    if (!author && !admin) {
      throw new Error('삭제할 권한이 없습니다');
    }

    await this.postRepository.remove(post);
    return true;
  }

  // 검색으로 게시글 찾기
  async findPostsBySearch(keyword: string, userId: number): Promise<Post[]> {
    const posts = await this.postRepository.find({
      where: {
        content: Like(`%${keyword}%`),
      },
      relations: ['user', 'images', 'likes', 'likes.user'],
      order: {
        created_at: 'DESC',
      },
    });

    return posts.map((post) => ({
      ...post,
      liked: post.likes.some((like) => like.user.id === userId),
    }));
  }

  // 모든 게시글 + 무한 스크롤
  async findAllPosts(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ items: any[]; totalCount: number }> {
    const [posts, totalCount] = await this.postRepository.findAndCount({
      relations: ['user', 'images', 'likes', 'likes.user', 'user.dogs'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const items = await Promise.all(
      posts.map(async (post) => {
        const liked = post.likes.some((like) => like.user.id === userId);

        const commentCount = await this.commentRepository.count({
          where: { post: { id: post.id } },
        });

        const dogImage = post.user?.dogs?.[0]?.dog_image || null;

        return {
          ...post,
          commentCount,
          liked,
          user: {
            ...post.user,
            dogImage,
          },
        };
      }),
    );

    return { items, totalCount };
  }

  // UserId로 게시글 찾기 + 무한스크롤
  async findPostsByUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ items: any[]; totalCount: number }> {
    const [items, totalCount]: [Post[], number] =
      await this.postRepository.findAndCount({
        where: { user: { id: userId } },
        relations: ['user', 'images', 'likes', 'likes.user', 'user.dogs'],
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    if (!items) return { items: [], totalCount: 0 };

    const finalItems = await Promise.all(
      items.map(async (post) => {
        const commentCount =
          await this.interactionsService.countCommentsByPostId(post.id);

        const liked = post.likes.some((like) => like.user.id === userId);

        return {
          ...post,
          commentCount,
          liked,
        };
      }),
    );

    return { items: finalItems, totalCount };
  }

  // 좋아요 개수
  async updateLikeCount(postId: number, count: number): Promise<void> {
    await this.postRepository.update(postId, { like_count: count });
  }

  // 유저당 작성글 개수
  async countPostsByUser(userId: number): Promise<number> {
    return this.postRepository.count({
      where: { user: { id: userId } },
    });
  }

  // 총 작성글 개수
  async countAllPosts() {
    return this.postRepository.count();
  }
}
