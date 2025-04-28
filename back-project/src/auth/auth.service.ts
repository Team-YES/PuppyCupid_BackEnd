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

  async issueTokens(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const access_token = jwt.sign(
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

    const refresh_token = jwt.sign(
      {},
      this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY')!,
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        audience: String(user.id),
      },
    );

    user.refresh_token = refresh_token;
    await this.userService.save(user);

    return {
      access_token,
      refresh_token,
    };
  }

  async socialLogin(
    req: Request,
    _res: Response,
    provider: 'google' | 'kakao' | 'naver',
  ) {
    try {
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

        return {
          ok: false,
          needPhoneNumber: true,
          message: '전화번호 입력이 필요합니다.',
          temp_access_token: tempToken,
        };
      }

      const tokens = await this.issueTokens(existingUser);

      return {
        ok: true,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
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
