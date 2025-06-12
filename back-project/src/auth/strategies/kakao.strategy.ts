import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('KAKAO_ID')!,
      clientSecret: configService.get<string>('KAKAO_SECRET')!,
      callbackURL: configService.get<string>('KAKAO_CALLBACK')!,
    });
  }

  async validate(profile: Profile): Promise<any> {
    const { _json } = profile;

    const email = _json.kakao_account?.email ?? null;
    const nickname = _json.properties?.nickname ?? '카카오 사용자';

    return {
      email,
      nickname,
      name: nickname,
      provider: 'kakao',
    };
  }
}
