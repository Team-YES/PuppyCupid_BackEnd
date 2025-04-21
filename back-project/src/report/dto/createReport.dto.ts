import { ApiProperty } from '@nestjs/swagger';
import { report_type } from '../report.entity';

export class CreateReportDto {
  @ApiProperty({
    enum: report_type,
    example: report_type.POST,
    description: '신고 대상 유형 (user, post, comment)',
  })
  reportType: report_type;

  @ApiProperty({
    example: 123,
    description: '신고 대상의 ID (예: 게시글 ID, 댓글 ID, 유저 ID)',
  })
  targetId: number;

  @ApiProperty({
    example: '욕설이 포함되어 있습니다.',
    description: '신고 사유',
  })
  reason: string;
}
