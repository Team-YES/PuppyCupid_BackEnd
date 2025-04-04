import {
  Controller,
  Post,
  Param,
  Req,
  UseGuards,
  Body,
  Get,
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
    const comment = await this.interactionsService.createComment(
      userId,
      postId,
      body.content,
      body.parentCommentId,
    );
    return { ok: true, comment };
  }

  @Get('comment/:postId')
  async getComments(@Param('postId') postId: number) {
    const comments = await this.interactionsService.getCommentsByPost(postId);
    return { ok: true, comments };
  }
}
