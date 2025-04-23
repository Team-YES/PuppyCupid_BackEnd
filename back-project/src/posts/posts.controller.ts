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
import { UpdatePostInput, PostsService } from './posts.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { InteractionsService } from 'src/interactions/interactions.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreatePostDto, UpdatePostDto } from './dto/posts.dto';

interface AuthRequest extends Request {
  user: {
    id: number;
    role: string;
  };
}
@ApiTags('게시글')
@Controller('posts')
@UseGuards(AuthGuard('jwt'))
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly interactionsService: InteractionsService,
  ) {}

  // 게시글 생성
  @Post('form')
  @ApiOperation({
    summary: '게시글 생성',
    description: '이미지 포함 게시글을 생성합니다.',
  })
  @ApiConsumes('multipart/form-data')
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
  @ApiBody({ type: CreatePostDto })
  async createPost(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreatePostDto,
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
  @Get('search')
  @ApiOperation({
    summary: '게시글 검색',
    description: '키워드로 게시글을 검색합니다.',
  })
  @ApiQuery({ name: 'keyword', required: true })
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
  @ApiOperation({
    summary: '게시글 상세 조회',
    description: 'postId로 게시글 상세 내용을 조회합니다.',
  })
  @ApiParam({ name: 'postId', type: Number })
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
  @ApiOperation({
    summary: '게시글 수정',
    description: '게시글 내용을 수정합니다.',
  })
  @ApiParam({ name: 'postId', type: Number })
  @ApiBody({ type: UpdatePostDto })
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
  @ApiOperation({ summary: '게시글 삭제', description: '게시글을 삭제합니다.' })
  @ApiParam({ name: 'postId', type: Number })
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
  @ApiOperation({
    summary: '게시글 전체 조회',
    description: '전체 게시글을 무한스크롤 방식으로 조회합니다.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAllPostsWithLikeComment(
    @Req() req: AuthRequest,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '2',
  ) {
    const userId = req.user.id;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { items, totalCount } = await this.postsService.findAllPosts(
      userId,
      pageNumber,
      limitNumber,
    );

    return {
      posts: items,
      currentUser: {
        id: userId,
      },
      totalCount,
      hasMore: pageNumber * limitNumber < totalCount,
    };
  }

  // 내가 쓴 게시물
  @Get('user')
  @ApiOperation({
    summary: '내가 작성한 게시글 조회',
    description: '현재 로그인한 사용자의 게시글을 조회합니다.',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUserPosts(
    @Req() req: AuthRequest,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '9',
  ) {
    const userId = req.user.id;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    return await this.postsService.findPostsByUser(
      userId,
      pageNumber,
      limitNumber,
    );
  }
}
