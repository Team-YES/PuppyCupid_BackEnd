import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Body,
  Get,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InteractionsService } from './interactions.service';
import { Request } from 'express';
import { UserRole } from '@/users/users.entity';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { CreateCommentDto } from './dto/createComment.dto';
import { CommentResponseDto } from './dto/commentRes.dto';
import { ToggleLikeResponseDto } from './dto/toggleLikeRes.dto';
import { DeleteCommentResponseDto } from './dto/deleteCommentRes.dto';
import { GetCommentsResponseDto } from './dto/getCommentsRes.dto';
interface AuthRequest extends Request {
  user: {
    id: number;
    role: UserRole;
  };
}

@ApiTags('Interactions')
@Controller('interactions')
@UseGuards(AuthGuard('jwt'))
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('like/:postId')
  @ApiOperation({ summary: '좋아요 토글' })
  @ApiResponse({
    status: 201,
    description: '좋아요 또는 좋아요 취소',
    type: ToggleLikeResponseDto,
  })
  async toggleLike(@Param('postId') postId: number, @Req() req: AuthRequest) {
    const userId = req.user.id;
    const { liked, likeCount } = await this.interactionsService.toggleLike(
      userId,
      postId,
    );
    return {
      ok: true,
      liked,
      likeCount,
    };
  }

  @Post('comment/:postId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 작성' })
  @ApiResponse({
    status: 201,
    description: '댓글 생성 성공',
    type: CommentResponseDto,
  })
  async createComment(
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;

    try {
      const commentResponse = await this.interactionsService.createComment(
        userId,
        postId,
        body.content,
        body.parentCommentId,
      );

      return { ok: true, content: commentResponse };
    } catch (err) {
      return { ok: false, error: err.message || 'Internal server error' };
    }
  }

  @Get('comment/:postId')
  @ApiOperation({ summary: '게시글 댓글 목록 조회' })
  @ApiResponse({ status: 200, type: GetCommentsResponseDto })
  async getComments(@Param('postId') postId: number) {
    const comments = await this.interactionsService.getCommentsByPost(postId);
    return { ok: true, comments, postId };
  }

  @Delete('comment/:commentId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 삭제' })
  @ApiResponse({ status: 200, type: DeleteCommentResponseDto })
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Req() req: AuthRequest,
  ) {
    const user = {
      id: req.user.id,
      role: req.user.role,
    };
    return await this.interactionsService.deleteComment(commentId, user);
  }
}
