import { Controller, Get, Query } from '@nestjs/common';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  async getWeather(
    @Query('lat') lat: string,
    @Query('lon') lon: string,
    @Query('dong_name') dong_name: string,
  ) {
    return this.weatherService.getWeather(+lat, +lon, dong_name);
  }
}
