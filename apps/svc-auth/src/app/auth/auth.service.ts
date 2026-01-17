import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // 1. Validar que el usuario existe y la contraseña coincide
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);

    // Si el usuario existe y la contraseña (hash) coincide:
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Devolvemos el usuario SIN la contraseña para seguridad
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Generar el Token JWT
  async login(user: any) {
    // En el payload guardamos info útil para el frontend
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
