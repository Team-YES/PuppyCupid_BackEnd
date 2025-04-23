import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async issueTokensAndSetCookies(
    user: User,
    res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const isProd = process.env.NODE_ENV === 'production';

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        isPhoneVerified: user.isPhoneVerified,
      },
      this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
      },
    );

    const refreshToken = jwt.sign(
      {},
      this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY')!,
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        audience: String(user.id),
      },
    );

    user.eid_refresh_token = refreshToken;
    await this.userService.save(user);

    const expires = new Date();
    expires.setDate(
      expires.getDate() +
        +this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_DATE'),
    );

    res.cookie('access_token', accessToken, {
      maxAge: 1000 * 60 * 60,
    });

    res.cookie('eid_refresh_token', refreshToken, {
      expires,
    });

    return { accessToken, refreshToken };
  }

  async socialLogin(
    req: Request,
    res: Response,
    provider: 'google' | 'kakao' | 'naver',
  ) {
    try {
      const isProd = process.env.NODE_ENV === 'production';
      const userFromOAuth = req.user as any;

      // 휴대폰 번호 기준 중복 검사
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

      // 이메일 기준 중복 검사
      const userByEmail = await this.userService.findUserByEmail(
        userFromOAuth.email,
      );
      if (userByEmail && (userByEmail.provider ?? null) !== provider) {
        return {
          ok: false,
          error: `이미 ${userByEmail.provider?.toUpperCase() || '다른'} 계정으로 가입된 이메일입니다.`,
        };
      }

      let existingUser = userByEmail;
      if (!existingUser) {
        existingUser = await this.userService.createUser({
          email: userFromOAuth.email,
          provider,
        });
      }

      if (!existingUser.phone || !existingUser.isPhoneVerified) {
        const tempToken = jwt.sign(
          { id: existingUser.id, role: 'unverified' },
          this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
          { expiresIn: '10m' },
        );

        res.cookie('temp_access_token', tempToken, {
          maxAge: 1000 * 60 * 10,
        });

        return {
          ok: false,
          needPhoneNumber: true,
          message: '전화번호 입력이 필요합니다.',
          temp_access_token: tempToken,
        };
      }

      const accessToken = await this.issueTokensAndSetCookies(
        existingUser,
        res,
      );

      return {
        ok: true,
        eid_access_token: accessToken,
      };
    } catch (error) {
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
