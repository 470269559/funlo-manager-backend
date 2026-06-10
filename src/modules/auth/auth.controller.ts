import { Body, Controller, Get, Post } from '@nestjs/common';
import type { AuthUser } from '../../common/auth/auth-user';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { Public } from '../../common/auth/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.authService.getProfile(user.userId);
  }

  @Get('menus')
  menus(@CurrentUser() user: AuthUser) {
    return this.authService.getMenus(user.userId);
  }
}
