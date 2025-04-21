import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from 'src/users/users.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as { id: number; role: UserRole };

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true;
  }
}
