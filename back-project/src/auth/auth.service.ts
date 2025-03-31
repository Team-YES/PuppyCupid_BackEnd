import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  async socialLogin(
    req: Request,
    res: Response,
    provider: 'google' | 'kakao' | 'naver',
  ) {
    try {
      const userFromOAuth = req.user as any;

      const user = {
        email: userFromOAuth.email,
        nickname: userFromOAuth.nickname,
        type: provider,
      };

      let existingUser = await this.userService.findUser(user.email);

      if (!existingUser) {
        existingUser = await this.userService.createUser(user);
      }

      // JWT payload 생성
      const payload = { id: existingUser.id };

      // access token 생성
      const accessToken = jwt.sign(
        payload,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
        {
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        },
      );

      // refresh token 생성
      const refreshToken = jwt.sign(
        {},
        this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY')!,
        {
          expiresIn: this.configService.get(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
          audience: String(existingUser.id),
        },
      );

      // 사용
      existingUser.eid_refresh_token = refreshToken;
      await this.userService.save(existingUser);

      // refresh token 쿠키 설정
      const isProd = process.env.NODE_ENV === 'production';
      const expires = new Date();
      expires.setDate(
        expires.getDate() +
          +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'),
      );

      res.cookie('eid_refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        expires,
      });

      return {
        ok: true,
        eid_access_token: accessToken,
      };
    } catch (error) {
      console.error(`[${provider.toUpperCase()} Login Error]`, error);
      return {
        ok: false,
        error: `${provider} 로그인 인증 중 오류가 발생했습니다.`,
      };
    }
  }

  async googleLogin(req: Request, res: Response) {
    return this.socialLogin(req, res, 'google');
  }

  async kakaoLogin(req: Request, res: Response) {
    return this.socialLogin(req, res, 'kakao');
  }

  async naverLogin(req: Request, res: Response) {
    return this.socialLogin(req, res, 'naver');
  }
}
