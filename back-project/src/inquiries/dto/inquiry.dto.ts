import { ApiProperty } from '@nestjs/swagger';
import { InquiryStatus, InquiryType } from '../inquiries.entity';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateInquiryDto {
  @ApiProperty({ example: '홍길동', description: '문의자 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'example@email.com', description: '이메일 주소' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '010-1234-5678', description: '전화번호' })
  @IsString()
  @Length(8, 20)
  phone: string;

  @ApiProperty({
    enum: InquiryType,
    example: InquiryType.SERVICE,
    description: '문의 유형 (서비스, 버그, 기타)',
  })
  @IsEnum(InquiryType)
  type: InquiryType;

  @ApiProperty({
    example: '서비스 이용 중 오류가 발생했습니다.',
    description: '문의 내용',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class UpdateInquiryStatusDto {
  @ApiProperty({
    enum: InquiryStatus,
    example: InquiryStatus.RESOLVED,
    description: '문의 상태 (처리중, 완료)',
  })
  @IsEnum(InquiryStatus)
  status: InquiryStatus;
}
