import { ApiProperty } from '@nestjs/swagger';
import { PostCategory } from '../posts.entity';

export class CreatePostDto {
  @ApiProperty({ enum: PostCategory, description: '게시글 카테고리' })
  category: PostCategory;

  @ApiProperty({ description: '게시글 내용' })
  content: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    description: '업로드할 이미지들 (최대 10장)',
  })
  images: any;
}

export class UpdatePostDto {
  @ApiProperty({ description: '수정할 게시글 내용' })
  content: string;
}
