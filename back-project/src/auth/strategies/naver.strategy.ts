// auth/strategies/naver.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('NAVER_ID')!,
      clientSecret: configService.get<string>('NAVER_SECRET')!,
      callbackURL: configService.get<string>('NAVER_CALLBACK')!,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user?: any, info?: any) => void,
  ) {
    try {
      const { _json } = profile;
      const user = {
        email: _json.email,
        nickname: _json.nickname,
        photo: _json.profile_image,
        provider: 'naver',
      };
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
