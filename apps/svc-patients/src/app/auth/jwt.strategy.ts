import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Decimos de dónde sacar el token (del header Authorization: Bearer ...)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // 2. ¡MUY IMPORTANTE! Debe ser LA MISMA clave que usaste en svc-auth
      secretOrKey: 'SECRET_KEY_SEGURA_123',
    });
  }

  async validate(payload: any) {
    // Si el token es válido, NestJS inyectará esto en el objeto 'req.user'
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
    };
  }
}
