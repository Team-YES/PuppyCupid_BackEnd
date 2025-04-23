import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { WeatherResponseDto } from './dto/weather.dto';
@ApiTags('날씨')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  @ApiOperation({
    summary: '날씨 조회',
    description:
      '위도(latitude)와 경도(longitude)를 기반으로 실시간 날씨 정보를 조회합니다. DB에 데이터가 없으면 외부 API에서 받아와 저장 후 반환.',
  })
  @ApiQuery({ name: 'lat', required: true, description: '위도 (latitude)' })
  @ApiQuery({ name: 'lon', required: true, description: '경도 (longitude)' })
  @ApiOkResponse({
    description: '요청한 좌표의 최신 날씨 정보',
    type: WeatherResponseDto,
  })
  async getWeather(@Query('lat') lat: string, @Query('lon') lon: string) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    return await this.weatherService.getWeather(latitude, longitude);
  }
}
