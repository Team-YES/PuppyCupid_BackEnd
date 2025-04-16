import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from './commentRes.dto';

export class GetCommentsResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ example: 1, description: '게시글 ID' })
  postId: number;

  @ApiProperty({
    type: [CommentResponseDto],
    description: '댓글 목록',
  })
  comments: CommentResponseDto[];
}
