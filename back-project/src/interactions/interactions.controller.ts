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
    const fullComment = await this.interactionsService.createComment(
      userId,
      postId,
      body.content,
      body.parentCommentId,
    );

    const dogs = fullComment.user?.dogs || [];
    const dogImage = dogs.length > 0 ? dogs[0].dog_image : null;

    const commentResponse = {
      id: fullComment.id,
      content: fullComment.content,
      created_at: fullComment.created_at,
      user: {
        id: fullComment.user.id,
        nickName: fullComment.user.nickName,
        dogImage,
      },
      parentCommentId: fullComment.parentComment?.id || null,
    };

    return { ok: true, content: commentResponse };
  }

  @Get('comment/:postId')
  async getComments(@Param('postId') postId: number) {
    const comments = await this.interactionsService.getCommentsByPost(postId);
    return { ok: true, comments };
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
