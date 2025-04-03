import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './posts.entity';
import { PostImage } from './post_images.entity';
import { UserRole } from 'src/users/users.entity';
import { PostCategory } from './posts.entity';
import { Like } from 'src/interactions/likes.entity';
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
  ) {}

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

  async findAllPosts(userId: number): Promise<any[]> {
    const posts = await this.postRepository.find({
      relations: ['user', 'images', 'likes'],
      order: { created_at: 'DESC' },
    });

    return posts.map((post) => ({
      ...post,
      liked: post.likes.some((like) => like.user.id === userId),
    }));
  }

  async findPostsByUser(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'images'],
      order: { created_at: 'DESC' },
    });
  }

  async updateLikeCount(postId: number, count: number): Promise<void> {
    await this.postRepository.update(postId, { like_count: count });
  }
}
