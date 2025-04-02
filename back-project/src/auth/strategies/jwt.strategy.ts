import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['access_token'];
        }
        return null;
      },
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      role: payload.role,
    };
  }
}
