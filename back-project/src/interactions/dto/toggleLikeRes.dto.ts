import { ApiProperty } from '@nestjs/swagger';

export class ToggleLikeResponseDto {
  @ApiProperty({ example: true, description: '좋아요 여부' })
  liked: boolean;

  @ApiProperty({ example: 17, description: '좋아요 수' })
  likeCount: number;
}
