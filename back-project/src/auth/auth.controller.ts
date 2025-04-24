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

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CheckNicknameQueryDto,
  CheckNicknameResDto,
  LoginDto,
  PhoneUpdateDto,
  TokenRefreshResDto,
  TokenResDto,
  TempTokenCheckResDto,
  UpdatePhoneResDto,
  AdminLoginDto,
  AdminLoginResDto,
} from './dto/auth.dto';
interface JwtUser {
  id: number;
  role: string;
}
@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}
  // 구글 로그인
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 요청' })
  async googleAuth(@Req() _req: Request) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: '구글 로그인 콜백' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      // 전화번호 필요 → 프론트에 임시 토큰과 상태 전달
      if (result.needPhoneNumber) {
        return res.redirect(
          `${FRONT_URL}/phone?temp_access_token=${result.temp_access_token}`,
        );
      }

      // 기타 로그인 실패
      return res.redirect(`${FRONT_URL}/login`);
    }

    // 정상 로그인 → 메인 페이지로 이동
    const { access_token, refresh_token } = result;
    return res.redirect(
      `${FRONT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }

  // // 카카오 로그인
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인 요청' })
  async kakaoAuth(@Req() _req: Request) {}

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiOperation({ summary: '카카오 로그인 콜백' })
  async kakaoAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.kakaoLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      // 전화번호 필요 → 프론트에 임시 토큰과 상태 전달
      if (result.needPhoneNumber) {
        return res.redirect(
          `${FRONT_URL}/phone?temp_access_token=${result.temp_access_token}`,
        );
      }

      // 기타 로그인 실패
      return res.redirect(`${FRONT_URL}/login`);
    }

    // 정상 로그인 → 메인 페이지로 이동
    const { access_token, refresh_token } = result;
    return res.redirect(
      `${FRONT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }

  // 네이버 로그인
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: '네이버 로그인 요청' })
  async naverAuth(@Req() _req: Request) {}

  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  @ApiOperation({ summary: '네이버 로그인 콜백' })
  async naverAuthCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.naverLogin(req, res);

    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;

    if (!result.ok) {
      // 전화번호 필요 → 프론트에 임시 토큰과 상태 전달
      if (result.needPhoneNumber) {
        return res.redirect(
          `${FRONT_URL}/phone?temp_access_token=${result.temp_access_token}`,
        );
      }

      // 기타 로그인 실패
      return res.redirect(`${FRONT_URL}/login`);
    }

    // 정상 로그인 → 메인 페이지로 이동
    const { access_token, refresh_token } = result;
    return res.redirect(
      `${FRONT_URL}/?access_token=${access_token}&refresh_token=${refresh_token}`,
    );
  }

  // 임시토큰 확인
  @Post('check-temp-token')
  @UseGuards(AuthGuard('jwt-temp'))
  @ApiOperation({ summary: '임시 토큰 유효성 검사' })
  @ApiResponse({ type: TempTokenCheckResDto })
  async checkTempToken(@Req() req: Request) {
    const user = req.user as JwtUser;
    const foundUser = await this.usersService.findUserById(user.id);
    if (!foundUser) return { isLoggedIn: false };
    return { isLoggedIn: true, user: foundUser };
  }

  // 전화번호
  @Post('update-phone')
  @UseGuards(AuthGuard('jwt-temp'))
  @ApiOperation({ summary: '전화번호 및 성별, 닉네임 등록' })
  @ApiBody({ type: PhoneUpdateDto })
  @ApiResponse({ type: UpdatePhoneResDto })
  async updatePhone(@Req() req: Request, @Body() body: PhoneUpdateDto) {
    const user = req.user as JwtUser;
    const userId = user?.id;
    if (!userId) return { ok: false, error: '유저 정보가 없습니다.' };

    const existing = await this.usersService.findUserByPhone(body.phone);
    if (existing && existing.id !== userId) {
      return {
        ok: false,
        error: `이미 ${existing.provider?.toUpperCase() || '다른'} 계정으로 가입된 전화번호입니다.`,
      };
    }

    await this.usersService.updatePhoneNumber(userId, body.phone);
    await this.usersService.setPhoneVerified(userId);
    await this.usersService.updateProfile(userId, body);

    const updatedUser = await this.usersService.findUserById(userId);
    if (!updatedUser) return { ok: false, error: '유저를 찾을 수 없습니다.' };

    const tokens = await this.authService.issueTokens(updatedUser);
    return { ok: true, message: '전화번호 등록 완료, 로그인 완료', ...tokens };
  }

  // 로그인 체크
  @Get('check')
  @ApiOperation({ summary: '로그인 상태 확인' })
  async checkLogin(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return { isLoggedIn: false };
    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      ) as JwtUser;
      const user = await this.usersService.findUserById(payload.id);
      return user ? { isLoggedIn: true, user } : { isLoggedIn: false };
    } catch {
      return { isLoggedIn: false };
    }
  }

  // 닉네임 중복 검사
  @Get('nickName')
  @UseGuards(AuthGuard('jwt-temp'))
  @ApiOperation({ summary: '임시 사용자 닉네임 중복 확인' })
  @ApiQuery({ name: 'nickName', type: String })
  @ApiResponse({ type: CheckNicknameResDto })
  async checkNickname(@Query() query: CheckNicknameQueryDto) {
    if (query.nickName) return { ok: false, error: '닉네임을 입력해주세요.' };
    const user = await this.usersService.findUserByNickname(query.nickName);
    return user
      ? { ok: false, message: '이미 사용 중인 닉네임입니다.' }
      : { ok: true, message: '사용 가능한 닉네임입니다.' };
  }

  // 관리자 로그인
  @Post('/adminLogin')
  @ApiOperation({ summary: '관리자 로그인' })
  @ApiBody({ type: AdminLoginDto })
  @ApiResponse({ status: 200, type: AdminLoginResDto })
  async adminLogin(@Body() body: AdminLoginDto) {
    const user = await this.usersService.findUserByEmail(body.email);
    if (!user || user.role !== UserRole.ADMIN)
      return { ok: false, error: '관리자 계정을 찾을 수 없습니다.' };

    const valid = await bcrypt.compare(body.password, user.admin_password);
    if (!valid) return { ok: false, error: '비밀번호가 틀렸습니다.' };

    const tokens = await this.authService.issueTokens(user);
    return { ok: true, message: '관리자 로그인 성공', ...tokens, user };
  }

  // 관리자 로그인 확인
  @Get('adminCheck')
  @ApiOperation({ summary: '관리자 로그인 상태 확인' })
  @ApiBearerAuth()
  async checkAdminLogin(@Req() req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return { isLoggedIn: false };
    const token = authHeader.split(' ')[1];

    try {
      const payload = jwt.verify(
        token,
        this.configService.get('JWT_ACCESS_TOKEN_SECRET_KEY')!,
      ) as JwtUser;
      const user = await this.usersService.findUserById(payload.id);
      return user
        ? { isLoggedIn: true, user: { id: user.id, email: user.email } }
        : { isLoggedIn: false };
    } catch {
      return { isLoggedIn: false };
    }
  }

  // 포폴용 유저
  @Post('login')
  @ApiOperation({ summary: '포폴용 로그인' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ type: TokenResDto })
  async login(@Body() body: LoginDto) {
    const user = await this.usersService.findUserByEmail(body.email);

    if (!user) {
      return { ok: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' };
    }

    const valid = await bcrypt.compare(body.password, user.admin_password);

    if (!valid) {
      return { ok: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' };
    }

    const tokens = await this.authService.issueTokens(user);
    return {
      ok: true,
      message: '로그인 성공',
      ...tokens,
    };
  }

  // 리프레시 토큰 확인
  @Get('refresh')
  @ApiOperation({ summary: '리프레시 토큰으로 액세스 토큰 재발급' })
  @ApiResponse({ type: TokenRefreshResDto })
  async refresh(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const refreshToken = authHeader?.split(' ')[1];

    if (!refreshToken) {
      return { ok: false, error: 'Refresh token이 없습니다.' };
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        this.configService.get('JWT_REFRESH_TOKEN_SECRET_KEY')!,
      ) as any;

      const user = await this.usersService.findUserById(Number(decoded.aud));
      if (!user || user.eid_refresh_token !== refreshToken) {
        return { ok: false, error: '토큰이 만료되었거나 일치하지 않습니다.' };
      }

      const { access_token } = await this.authService.issueTokens(user);
      return { ok: true, access_token };
    } catch {
      return { ok: false, error: '토큰 검증 실패' };
    }
  }
}
