import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AUTH_ERROR_MESSAGES } from '../../modules/auth/auth-error.messages';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: unknown;
    }>();
    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.LOGIN_EXPIRED);
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
      return true;
    } catch {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.LOGIN_EXPIRED);
    }
  }

  private extractToken(authorization?: string) {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
