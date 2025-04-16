import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AddToBlacklistDto {
  @ApiProperty({ example: '욕설로 인한 블랙리스트 처리' })
  @IsString()
  reason: string;
}
