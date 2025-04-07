import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Param,
  Req,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
  Get,
  Query,
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
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { InteractionsService } from 'src/interactions/interactions.service';

interface AuthRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
  ) {}

  // 게시글 생성
  @Post('form')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cd) => {
          const ext = path.extname(file.originalname);
          const filename = `${uuidv4()}${ext}`;
          cd(null, filename);
        },
      }),
    }),
  )
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Req() req: AuthRequest,
  ) {
    const { category, content } = body;
    const { id, role } = req.user;

    const imageUrls = files.map((file) => `/uploads/posts/${file.filename}`);
    const mainImageUrl = imageUrls[0] || '';

    return this.postsService.createPost({
      user: {
        id: id,
        role: role as UserRole,
      },
      category,
      content,
      mainImageUrl,
      imageUrls,
    });
  }

  // 게시물 검색
  @Get('/search')
  @UseGuards(AuthGuard('jwt'))
  async searchPosts(
    @Query('keyword') keyword: string,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;

    if (!keyword || keyword.trim().length < 2) {
      return {
        ok: true,
        posts: [],
        currentUser: { id: userId },
      };
    }

    const posts = await this.postsService.findPostsBySearch(keyword, userId);
    return { ok: true, posts, currentUser: { id: userId } };
  }

  // 아이디로 게시물 불러오기
  @Get(':postId')
  @UseGuards(AuthGuard('jwt'))
  async getPostDetail(
    @Param('postId') postId: number,
    @Req() req: AuthRequest,
  ) {
    const post = await this.postsService.findPostById(postId);

    const comments = await this.interactionsService.getCommentsByPost(postId);

    return {
      ok: true,
      post,
      comments,
      currentUserId: req.user.id,
    };
  }

  // 게시글 수정
  @Post(':postId')
  @UseGuards(AuthGuard('jwt'))
  async updatePost(
    @Param('postId') postId: number,
    @Body() body: Omit<UpdatePostInput, 'postId'>,
  ) {
    const { content } = body;

    return this.postsService.updatePost({
      postId,
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

  // 모든 게시물
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllPostsWithLike(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const posts = await this.postsService.findAllPosts(userId);

    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const comments = await this.interactionsService.getCommentsByPost(
          post.id,
        );
        return {
          ...post,
          comments,
        };
      }),
    );

    return {
      posts: postsWithComments,
      currentUser: {
        id: userId,
      },
    };
  }

  // 내가 쓴 게시물
  @Get('user')
  @UseGuards(AuthGuard('jwt'))
  async getUserPosts(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return await this.postsService.findPostsByUser(userId);
  }
}
