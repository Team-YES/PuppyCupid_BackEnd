import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './posts.entity';
import { PostImage } from './post_images.entity';
import { UserRole } from 'src/users/users.entity';
import { PostCategory } from './posts.entity';

export interface CreatePostInput {
  user: {
    id: number;
    role: UserRole;
  };
  category: PostCategory;
  title: string;
  content: string;
  mainImageUrl: string;
  imageUrls: string[];
}

export interface UpdatePostInput {
  postId: number;
  title: string;
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
    const { user, category, title, content, mainImageUrl, imageUrls } = input;

    const post = this.postRepository.create({
      user,
      category,
      title,
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
    const { postId, title, content } = input;

    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('게시글을 찾을 수 없습니다.');
    }

    post.title = title;
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

  async findAllPosts(): Promise<Post[]> {
    return await this.postRepository.find({
      relations: ['user', 'images'],
      order: { created_at: 'DESC' },
    });
  }

  async findPostsByUser(userId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'images'],
      order: { created_at: 'DESC' },
    });
  }
}
