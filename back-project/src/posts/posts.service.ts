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
  ) {}

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

  async findAllPosts(
    userId: number,
    page: number,
    limit: number,
  ): Promise<any[]> {
    const posts = await this.postRepository.find({
      relations: ['user', 'images', 'likes', 'likes.user'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 댓글 포함
    return Promise.all(
      posts.map(async (post) => {
        const liked = post.likes.some((like) => like.user.id === userId);

        // 댓글 가져오기 (user, dog 정보까지 포함해서)
        const comments = await this.commentRepository.find({
          where: { post: { id: post.id } },
          relations: ['user', 'user.dogs', 'parentComment'],
          order: { created_at: 'ASC' },
        });

        const mappedComments = comments.map((comment) => {
          const dogs = comment.user?.dogs || [];
          const dogImage = dogs.length > 0 ? dogs[0].dog_image : null;

          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            parentCommentId: comment.parentComment?.id || null,
            user: {
              id: comment.user.id,
              nickName: comment.user.nickName,
              dogImage,
            },
          };
        });

        return {
          ...post,
          liked,
          comments: mappedComments,
        };
      }),
    );
  }

  async findPostsByUser(
    userId: number,
    page: number,
    limit: number,
  ): Promise<Post[]> {
    return await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'images'],
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async updateLikeCount(postId: number, count: number): Promise<void> {
    await this.postRepository.update(postId, { like_count: count });
  }
}
