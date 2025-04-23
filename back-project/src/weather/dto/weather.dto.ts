import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponseDto {
  @ApiProperty({ example: 37.5665, description: '위도 (Latitude)' })
  latitude: number;

  @ApiProperty({ example: 126.978, description: '경도 (Longitude)' })
  longitude: number;

  @ApiProperty({ example: 22.5, description: '기온 (℃)' })
  temperature: number;

  @ApiProperty({ example: 60, description: '습도 (%)' })
  humidity: number;

  @ApiProperty({ example: 4.6, description: '풍속 (m/s)' })
  wind_speed: number;

  @ApiProperty({ example: 'Clear', description: '날씨 요약' })
  weather_main: string;

  @ApiProperty({ example: 'clear sky', description: '날씨 설명' })
  weather_desc: string;

  @ApiProperty({ example: '01d', description: '날씨 아이콘 코드' })
  icon: string;

  @ApiProperty({
    example: '2025-04-22T10:00:00.000Z',
    description: '기록된 시각 (UTC)',
  })
  recorded_at: Date;
}
