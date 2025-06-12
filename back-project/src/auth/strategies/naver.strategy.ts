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

  async validate(profile: Profile): Promise<any> {
    const { _json } = profile;
    return {
      email: _json.email,
      name: _json.nickname,
      provider: 'naver',
    };
  }
}
