import { Injectable, UnauthorizedException, Inject } from '@nestjs/common'; // 👈 Agregamos Inject
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices'; // 👈 Agregamos ClientProxy
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    // 👇 3. Inyectamos el cliente de Auditoría
    @Inject('AUDIT_SERVICE') private auditClient: ClientProxy,
  ) {}

  async login(loginDto: any) {
    const { email, password } = loginDto;

    // 1. Buscamos al usuario real por su email
    const user = await this.usersService.findOneByEmail(email);

    // 2. ¿No existe el usuario? O ¿La contraseña no coincide?
    if (!user || !bcrypt.compareSync(password, user.password)) {
      console.log(`❌ Intento de login fallido para: ${email}`);

      // 👇 4. AUDITAR FALLO (Seguridad)
      this.auditClient.emit('audit_event', {
        action: 'USER_LOGIN_FAILED',
        resourceId: email,
        actor: 'anonymous',
        timestamp: new Date(),
        details: { reason: 'Invalid credentials or user not found' },
      });

      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    // 3. Si pasó el check anterior, generamos el Token
    console.log(`✅ Login exitoso: ${user.email}`);

    // 👇 5. AUDITAR ÉXITO
    this.auditClient.emit('audit_event', {
      action: 'USER_LOGIN_SUCCESS',
      resourceId: user.id,
      actor: user.id, // El actor es el usuario mismo
      timestamp: new Date(),
      details: {
        email: user.email,
        roles: user.roles,
      },
    });

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
