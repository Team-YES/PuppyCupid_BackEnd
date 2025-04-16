import { ApiProperty } from '@nestjs/swagger';

export class CommentUserDto {
  @ApiProperty({ example: 1, description: '사용자 ID' })
  id: number;

  @ApiProperty({ example: 'yujeen', description: '닉네임' })
  nickName: string;

  @ApiProperty({
    example: 'https://example.com/dog.jpg',
    description: '반려견 이미지 URL',
    nullable: true,
  })
  dogImage: string | null;
}

export class CommentResponseDto {
  @ApiProperty({ example: 5, description: '댓글 ID' })
  id: number;

  @ApiProperty({ example: '좋은 게시글이네요!', description: '댓글 내용' })
  content: string;

  @ApiProperty({ example: '2025-04-16T12:34:56.789Z', description: '생성일' })
  created_at: Date;

  @ApiProperty({ example: 2, description: '게시글 ID' })
  postId: number;

  @ApiProperty({ type: () => CommentUserDto, description: '댓글 작성자 정보' })
  user: CommentUserDto;

  @ApiProperty({ example: null, description: '부모 댓글 ID (없으면 null)' })
  parentCommentId: number | null;
}
