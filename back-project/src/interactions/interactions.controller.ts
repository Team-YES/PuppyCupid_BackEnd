import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Body,
  Get,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InteractionsService } from './interactions.service';
import { Request } from 'express';

interface AuthRequest extends Request {
  user: {
    id: number;
  };
}

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('like/:postId')
  @UseGuards(AuthGuard('jwt'))
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
  async createComment(
    @Param('postId') postId: number,
    @Body() body: { content: string; parentCommentId?: number },
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
  async getComments(@Param('postId') postId: number) {
    const comments = await this.interactionsService.getCommentsByPost(postId);
    return { ok: true, comments, postId };
  }

  @Delete('comment/:commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Param('commentId') commentId: number,
    @Req() req: AuthRequest,
  ) {
    const userId = req.user.id;
    return await this.interactionsService.deleteComment(commentId, userId);
  }
}
