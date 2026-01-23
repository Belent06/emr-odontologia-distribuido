import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    // 🚀 Llamamos directamente al método login del servicio.
    // Este método ya valida las credenciales y genera el JWT.
    return this.authService.login(loginDto);
  }
}
