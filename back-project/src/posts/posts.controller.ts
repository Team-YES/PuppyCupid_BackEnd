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
import { PostsService } from './posts.service';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from 'src/users/users.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 게시글 생성
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createPost(@Body() Body, @Req() req) {
    const { category, title, content, mainImageUrl, imageUrls } = req;

    return this.postsService.createPost({
      user: req.user,
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
  async updatePost(@Param('postId') postId: number, @Body() body) {
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
  async deletePost(@Param('postId') postId: number, @Req() req) {
    const { userId, role } = req.user;

    return this.postsService.deletePost({
      postId,
      user: {
        id: userId,
        role: role as UserRole,
      },
    });
  }
}
