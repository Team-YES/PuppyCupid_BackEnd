import { ApiProperty } from '@nestjs/swagger';

export class FollowUserDto {
  @ApiProperty({ example: 1, description: '유저 ID' })
  id: number;

  @ApiProperty({ example: '댕댕이주인', description: '유저 닉네임' })
  nickName: string;

  @ApiProperty({
    example: '/uploads/dogsImage/dog123.jpg',
    description: '강아지 이미지 URL',
    nullable: true,
  })
  dogImage: string | null;
}

export class FollowStatusDto {
  @ApiProperty({
    example: true,
    description: '내가 상대를 팔로우하고 있는지 여부',
  })
  isFollowing: boolean;

  @ApiProperty({
    example: false,
    description: '상대가 나를 팔로우하고 있는지 여부',
  })
  isFollowedBy: boolean;
}

export class ToggleFollowResponseDto {
  @ApiProperty({
    example: true,
    description: '팔로우 성공 여부 (언팔로우 시 false)',
  })
  followed: boolean;
}
