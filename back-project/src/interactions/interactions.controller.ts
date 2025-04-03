import { Controller, Post, Param, Req, UseGuards } from '@nestjs/common';
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
  @UseGuards(AuthGuard('jwt'))
  @Post('like/:postId')
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
}
