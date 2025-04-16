import { ApiProperty } from '@nestjs/swagger';

export class AddToBlacklistResDto {
  @ApiProperty({ example: true, description: '요청 성공 여부' })
  ok: boolean;

  @ApiProperty({ example: 5, description: '블랙리스트에 등록된 유저 ID' })
  targetUserId: number;
}
