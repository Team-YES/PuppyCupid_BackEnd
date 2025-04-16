import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: '댓글 내용',
    example: '게시글의 내용이 도움이 돼요',
  })
  content: string;

  @ApiProperty({
    description: '부모 댓글 ID (대댓글일 경우)',
    example: 3,
    required: false,
  })
  parentCommentId?: number;
}
