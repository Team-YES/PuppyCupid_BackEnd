import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/users/users.entity';
import {
  CreatePostInput,
  UpdatePostInput,
  DeletePostInput,
  PostsService,
} from './posts.service';

interface AuthRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 게시글 생성
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPost(
    @Body() body: Omit<CreatePostInput, 'user'>,
    @Req() req: AuthRequest,
  ) {
    const { category, title, content, mainImageUrl, imageUrls } = body;
    const { id, role } = req.user;

    return this.postsService.createPost({
      user: {
        id: id,
        role: role as UserRole,
      },
      category,
      title,
      content,
      mainImageUrl,
      imageUrls,
    });
  }

  // 게시글 수정
  @Put(':postId')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('postId') postId: number,
    @Body() body: Omit<UpdatePostInput, 'postId'>,
  ) {
    const { title, content } = body;

    return this.postsService.updatePost({
      postId,
      title,
      content,
    });
  }

  // 게시글 삭제
  @Delete(':postId')
  @UseGuards(AuthGuard('jwt'))
  async deletePost(@Param('postId') postId: number, @Req() req: AuthRequest) {
    const { id, role } = req.user;

    return this.postsService.deletePost({
      postId,
      user: {
        id: id,
        role: role as UserRole,
      },
    });
  }
}
