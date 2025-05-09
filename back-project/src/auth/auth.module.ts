import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtNaverStrategy } from './strategies/naver.strategy';
import { JwtKakaoStrategy } from './strategies/kakao.strategy';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { JwtGoogleStrategy } from './strategies/google.strategy';
import { JwtTempStrategy } from './strategies/jwt-temp.strategy';

@Module({
  imports: [UsersModule, PassportModule, ConfigModule, JwtModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'),
      signOptions: {
        expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    }),
    inject: [ConfigService],
  }),],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtNaverStrategy,
    JwtKakaoStrategy,
    JwtGoogleStrategy,
    JwtTempStrategy,
  ],
})
export class AuthModule {}
