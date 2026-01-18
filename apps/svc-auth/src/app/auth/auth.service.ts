import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: any) {
    const { email, password } = loginDto;

    // 1. Buscamos al usuario real por su email
    const user = await this.usersService.findOneByEmail(email);

    // 2. ¿No existe el usuario? O ¿La contraseña no coincide?
    // bcrypt.compareSync compara el texto plano con el hash de la DB
    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log(`❌ Intento de login fallido para: ${email}`);
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // 3. Si pasó el check anterior, generamos el Token con datos reales
    console.log(`✅ Login exitoso: ${user.email}`);
    const payload = { email: user.email, sub: user.id, roles: user.roles };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        email: user.email,
        name: user.name || user.email,
        roles: user.roles,
      },
    };
  }
}
