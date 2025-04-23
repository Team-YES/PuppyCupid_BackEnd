import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { Gender, UserRole } from 'src/users/users.entity';

interface JwtUser {
  id: number;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}
  // 구글 로그인
  @Get('/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request) {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      return res.redirect(`${FRONT_URL}/login`);
    }
    return res.redirect(`${FRONT_URL}`);
  }

  // // 카카오 로그인
  @Get('/kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth(@Req() _req: Request) {}

  @Get('/kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.kakaoLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      return res.redirect(`${FRONT_URL}/login`);
    }
    return res.redirect(`${FRONT_URL}`);
  }

  // 네이버 로그인
  @Get('/naver')
  @UseGuards(AuthGuard('naver'))
  async naverAuth(@Req() _req: Request) {}

  @Get('/naver/callback')
  @UseGuards(AuthGuard('naver'))
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.naverLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      return res.redirect(`${FRONT_URL}/login`);
    }
    return res.redirect(`${FRONT_URL}`);
  }

  // 임시토큰 확인
  @Post('/check-temp-token')
  @UseGuards(AuthGuard('jwt-temp'))
  async checkTempToken(@Req() req: Request) {
    console.log('🍪 쿠키:', req.cookies);
    const user = req.user as JwtUser;

    const foundUser = await this.usersService.findUserById(user.id);
    if (!foundUser) {
      return { isLoggedIn: false };
    }

    return {
      isLoggedIn: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        phoneNumber: foundUser.phone,
        nickName: foundUser.nickName,
        gender: foundUser.gender,
        isPhoneVerified: foundUser.isPhoneVerified,
        power_expired_at: foundUser.power_expired_at,
      },
    };
  }

  // 닉네임 중복 검사
  @Get('/nickName')
  @UseGuards(AuthGuard('jwt-temp'))
  async checkNickname(@Query('nickName') nickName: string) {
    if (!nickName) {
      return { ok: false, error: '닉네임을 입력해주세요.' };
    }

    const user = await this.usersService.findUserByNickname(nickName);

    if (user) {
      return { ok: false, message: '이미 사용 중인 닉네임입니다.' };
    }

    return { ok: true, message: '사용 가능한 닉네임입니다.' };
  }

  // 전화번호
  @Post('/update-phone')
  @UseGuards(AuthGuard('jwt-temp'))
  async updatePhone(
    @Req() req: Request,
    @Body() body: { phone: string; gender: Gender; nickName: string },
    @Res() res: Response,
  ) {
    const user = req.user as JwtUser;
    const userId = user?.id;

    if (!userId) {
      return res
        .status(400)
        .json({ ok: false, error: '유저 정보가 없습니다.' });
    }

    const existingByPhone = await this.usersService.findUserByPhone(body.phone);
    if (existingByPhone && existingByPhone.id !== userId) {
      return res.status(409).json({
        ok: false,
        error: `이미 ${existingByPhone.provider?.toUpperCase() || '다른'} 계정으로 가입된 전화번호입니다.`,
      });
    }

    await this.usersService.updatePhoneNumber(userId, body.phone);
    await this.usersService.setPhoneVerified(userId);
    await this.usersService.updateProfile(userId, {
      phone: body.phone,
      nickName: body.nickName,
      gender: body.gender,
    });

    res.clearCookie('temp_access_token');
    const updatedUser = await this.usersService.findUserById(userId);
    if (!updatedUser) {
      return res
        .status(404)
        .json({ ok: false, error: '유저를 찾을 수 없습니다.' });
    }

    const { accessToken, refreshToken } =
      await this.authService.issueTokensAndSetCookies(updatedUser, res);

    return res.status(200).json({
      ok: true,
      message: '전화번호 등록 완료, 로그인 완료',
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  // 로그인 체크
  @Get('/check')
  async checkLogin(@Req() req: Request) {
    const token = req.cookies['access_token'];
    if (!token) return { isLoggedIn: false };

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      ) as JwtUser;

      const user = await this.usersService.findUserById(payload.id);
      if (!user) {
        return { isLoggedIn: false };
      }

      return {
        isLoggedIn: true,
        user: {
          id: user.id,
          role: user.role,
          email: user.email,
          phoneNumber: user.phone,
          nickName: user.nickName,
          gender: user.gender,
          isPhoneVerified: user.isPhoneVerified,
          power_expired_at: user.power_expired_at,
        },
      };
    } catch {
      return { isLoggedIn: false };
    }
  }

  // 관리자 로그인
  @Post('/adminLogin')
  async adminLogin(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    const user = await this.usersService.findUserByEmail(body.email);

    if (!user || user.role !== UserRole.ADMIN) {
      return res
        .status(403)
        .json({ ok: false, error: '관리자 계정을 찾을 수 없습니다.' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      body.password,
      user.admin_password,
    );

    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ ok: false, error: '비밀번호가 틀렸습니다.' });
    }

    const tokens = await this.authService.issueTokensAndSetCookies(user, res);

    return res.status(200).json({
      ok: true,
      message: '관리자 로그인 성공',
      access_token: tokens.accessToken,
    });
  }

  // 관리자 로그인 확인
  @Get('/adminCheck')
  async checkAdminLogin(@Req() req: Request) {
    const token = req.cookies['access_token'];
    if (!token) return { isLoggedIn: false };

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      ) as JwtUser;

      const user = await this.usersService.findUserById(payload.id);
      if (!user) {
        return { isLoggedIn: false };
      }

      return {
        isLoggedIn: true,
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch {
      return { isLoggedIn: false };
    }
  }

  @Get('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['eid_refresh_token'];

    if (!refreshToken) {
      return res
        .status(401)
        .json({ ok: false, error: 'Refresh token이 없습니다.' });
    }

    try {
      const decoded: any = jwt.verify(
        refreshToken,
        this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY')!,
      );

      const userId = decoded.aud;
      if (!userId) {
        return res
          .status(401)
          .json({ ok: false, error: '유효하지 않은 토큰입니다.' });
      }

      const user = await this.usersService.findUserById(Number(userId));

      if (!user || user.eid_refresh_token !== refreshToken) {
        return res
          .status(401)
          .json({ ok: false, error: '토큰이 만료되었거나 일치하지 않습니다.' });
      }

      const { accessToken } = await this.authService.issueTokensAndSetCookies(
        user,
        res,
      );

      return res.status(200).json({ ok: true, access_token: accessToken });
    } catch (err) {
      return res.status(401).json({ ok: false, error: '토큰 검증 실패' });
    }
  }

  @Get('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('eid_refresh_token');
    res.clearCookie('access_token');

    return res.status(200).json({
      ok: true,
      message: '로그아웃 성공',
    });
  }
}
