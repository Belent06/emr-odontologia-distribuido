import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() req) {
    // 1. Validamos usuario y contraseña
    const user = await this.authService.validateUser(
      req.username,
      req.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Si es válido, entregamos el token
    return this.authService.login(user);
  }
}
