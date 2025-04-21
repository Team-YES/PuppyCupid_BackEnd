import { ApiProperty } from '@nestjs/swagger';
import { Gender, UserRole } from '@/users/users.entity';

export class UserInfoDto {
  @ApiProperty({ example: 1, description: '유저 ID' })
  id: number;

  @ApiProperty({ example: 'user@example.com', description: '이메일 주소' })
  email: string;

  @ApiProperty({ example: '멍멍이짱', description: '닉네임', nullable: true })
  nickName: string | null;

  @ApiProperty({
    example: '01012345678',
    description: '휴대폰 번호',
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    description: '성별',
    nullable: true,
  })
  gender: Gender | null;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: '유저 권한',
  })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: '휴대폰 인증 여부',
  })
  isPhoneVerified: boolean;

  @ApiProperty({
    example: '2024-05-01T12:34:56.789Z',
    description: '가입일',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-04-30T23:59:59.000Z',
    description: '이용권 만료일 (없을 수 있음)',
    nullable: true,
  })
  power_expired_at: Date | null;
}

export class GetAllUsersResponseDto {
  @ApiProperty({ example: true })
  ok: boolean;

  @ApiProperty({ type: [UserInfoDto] })
  users: UserInfoDto[];
}
