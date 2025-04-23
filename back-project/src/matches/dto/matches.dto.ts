import { ApiProperty } from '@nestjs/swagger';

export class MatchResponseDto {
  @ApiProperty({ example: 1, description: '강아지 ID' })
  id: number;

  @ApiProperty({ example: '푸들이', description: '견종 또는 강아지 이름' })
  name: string;

  @ApiProperty({ example: 'ISFP', description: '강아지 MBTI' })
  mbti: string;

  @ApiProperty({
    example: '활발함, 애교쟁이',
    description: '강아지 성격 (문자열, 쉼표로 구분)',
  })
  personality: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: '강아지 이미지 URL' })
  imageUrl: string;

  @ApiProperty({ example: 37.5665, description: '위도' })
  latitude: number;

  @ApiProperty({ example: 126.978, description: '경도' })
  longitude: number;

  @ApiProperty({ example: 123, description: '강아지 보호자 유저 ID' })
  userId: number;
}
