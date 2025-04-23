import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { Gender } from '../users.entity';

export class UserInfoDto {
  @ApiProperty({ example: 1, description: '유저 ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  email: string;

  @ApiProperty({ example: '댕댕이주인', description: '닉네임' })
  nickName: string | null;

  @ApiProperty({ example: '01012345678', description: '전화번호' })
  phone: string | null;
}

export class NicknameCheckResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ example: '사용 가능한 닉네임입니다.', required: false })
  message?: string;

  @ApiProperty({ example: '이미 사용 중인 닉네임입니다.', required: false })
  error?: string;
}

export class UpdateUserProfileDto {
  @ApiProperty({ example: '댕댕이주인', description: '닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ example: '01012345678', description: '전화번호' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: Gender, description: '성별' })
  @IsEnum(Gender)
  gender: Gender;
}
