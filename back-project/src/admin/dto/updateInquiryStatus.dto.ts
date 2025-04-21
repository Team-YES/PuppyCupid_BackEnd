import { IsEnum } from 'class-validator';
import { InquiryStatus } from '@/inquiries/inquiries.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInquiryStatusDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    description: '문의 처리 상태 (PENDING | IN_PROGRESS | RESOLVED)',
    enum: InquiryStatus,
  })
  @IsEnum(InquiryStatus)
  status: InquiryStatus;
}
