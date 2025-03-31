import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Weather } from './weather.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  private readonly OPEN_WEATHER_KEY: string;
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectRepository(Weather)
    private readonly weatherRepository: Repository<Weather>,
  ) {
    this.OPEN_WEATHER_KEY = this.configService.get<string>('OPEN_WEATHER_KEY')!;
  }

  async fetchRealtimeWeather(lat: number, lon: number): Promise<any> {
    const url = 'https://api.openweathermap.org/data/2.5/weather';
    const params = {
      lat,
      lon,
      units: 'metric',
      appid: this.OPEN_WEATHER_KEY,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { params }),
      );
      const data = response.data;

      return {
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        weather: data.weather[0].main,
        description: data.weather[0].description,
        wind_speed: data.wind.speed,
        humidity: data.main.humidity,
        icon: data.weather[0].icon,
      };
    } catch (error) {
      this.logger.error(`API 요청 실패: ${error.message}`);
      return null;
    }
  }

  async saveWeatherData(lat: number, lon: number) {
    const weatherData = await this.fetchRealtimeWeather(lat, lon);
    if (!weatherData) return null;

    const newWeather = this.weatherRepository.create({
      latitude: lat,
      longitude: lon,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      wind_speed: weatherData.wind_speed,
      weather_main: weatherData.weather,
      weather_desc: weatherData.description,
      icon: weatherData.icon,
    });

    return await this.weatherRepository.save(newWeather);
  }

  async getWeather(lat: number, lon: number) {
    const recentWeather = await this.weatherRepository.findOne({
      where: { latitude: lat, longitude: lon },
      order: { recorded_at: 'DESC' },
    });

    if (recentWeather) {
      return recentWeather;
    }

    return await this.saveWeatherData(lat, lon);
  }
}
