import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../users/users.entity';
import { UserInfoDto } from '../../users/dto/users.dto';

export class CheckNicknameQueryDto {
  @ApiProperty({ example: 'puppy_lover', description: '중복 확인할 닉네임' })
  nickName: string;
}

export class CheckNicknameResDto {
  @ApiProperty({ example: true, description: '닉네임 사용 가능 여부' })
  ok: boolean;

  @ApiProperty({
    example: '사용 가능한 닉네임입니다.',
    description: '결과 메시지',
    required: false,
  })
  message?: string;

  @ApiProperty({
    example: '이미 사용 중인 닉네임입니다.',
    description: '에러 메시지',
    required: false,
  })
  error?: string;
}

export class TempTokenCheckResDto {
  @ApiProperty({ example: true, description: '로그인 여부' })
  isLoggedIn: boolean;

  @ApiProperty({ type: UserInfoDto, required: false, description: '유저 정보' })
  user?: UserInfoDto;
}

export class PhoneUpdateDto {
  @ApiProperty({ example: '01012345678', description: '전화번호' })
  phone: string;

  @ApiProperty({ example: 'nickname123', description: '닉네임' })
  nickName: string;

  @ApiProperty({ example: 'male', enum: Gender, description: '성별' })
  gender: Gender;
}

export class UpdatePhoneResDto {
  @ApiProperty({ example: true, description: '성공 여부' })
  ok: boolean;

  @ApiProperty({
    example: '전화번호 등록 완료, 로그인 완료',
    description: '메시지',
  })
  message: string;

  @ApiProperty({
    example: 'access.token.jwt.value',
    description: '새로 발급된 access token',
  })
  access_token: string;

  @ApiProperty({
    example: 'refresh.token.jwt.value',
    description: '새로 발급된 refresh token',
  })
  refresh_token: string;
}

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: '이메일' })
  email: string;

  @ApiProperty({ example: 'securepassword123!', description: '비밀번호' })
  password: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@example.com', description: '관리자 이메일' })
  email: string;

  @ApiProperty({ example: 'securepassword', description: '비밀번호' })
  password: string;
}

export class AdminLoginResDto {
  @ApiProperty({ example: true, description: '성공 여부' })
  ok: boolean;

  @ApiProperty({ example: '관리자 로그인 성공', description: '메시지' })
  message: string;

  @ApiProperty({ example: 'access.token.jwt.value' })
  access_token: string;

  @ApiProperty({ example: 'refresh.token.jwt.value' })
  refresh_token: string;
}

export class TokenResDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Access Token',
  })
  access_token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh Token',
  })
  refresh_token: string;
}

export class TokenRefreshResDto {
  @ApiProperty({ example: true, description: '성공 여부' })
  ok: boolean;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '새로 발급된 액세스 토큰',
  })
  access_token: string;
}
