import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrae el token del header 'Authorization: Bearer <TOKEN>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'SECRET_KEY_SEGURA_123', // ⚠️ DEBE SER LA MISMA QUE EN SVC-AUTH
    });
  }

  async validate(payload: any) {
    // Lo que retornemos aquí se guardará en req.user
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
