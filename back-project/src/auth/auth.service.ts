import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async socialLogin(
    req: Request,
    res: Response,
    provider: 'google' | 'kakao' | 'naver',
  ) {
    try {
      const isProd = process.env.NODE_ENV === 'production';

      const userFromOAuth = req.user as any;

      if (userFromOAuth.phoneNumber) {
        const userByPhone = await this.userService.findUserByPhone(
          userFromOAuth.phoneNumber,
        );
        if (userByPhone && (userByPhone.provider ?? null) !== provider) {
          return {
            ok: false,
            error: `이미 ${userByPhone.provider?.toUpperCase() || '다른'} 계정으로 가입된 사용자입니다.`,
          };
        }
      }

      const user = {
        email: userFromOAuth.email,
        name: userFromOAuth.name,
        provider,
      };

      let existingUser = await this.userService.findUserByEmail(user.email);

      if (!existingUser) {
        existingUser = await this.userService.createUser(user);
      }

      // 전화번호가 없으면 임시 로그인 처리
      if (!existingUser.phone || !existingUser.isPhoneVerified) {
        const tempToken = jwt.sign(
          { id: existingUser.id, role: 'unverified' },
          this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
          { expiresIn: '10m' },
        );

        res.cookie('access_token', tempToken, {
          httpOnly: false,
          secure: isProd,
          sameSite: isProd ? 'none' : 'lax',
          maxAge: 1000 * 60 * 10,
        });

        return {
          ok: false,
          needPhoneNumber: true,
          message: '전화번호 입력이 필요합니다.',
          temp_access_token: tempToken,
        };
      }

      // JWT payload 생성
      const payload = {
        id: existingUser.id,
        role: existingUser.role,
        isPhoneVerified: true,
      };

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
      const expires = new Date();
      expires.setDate(
        expires.getDate() +
          +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'),
      );

      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60,
      });

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
