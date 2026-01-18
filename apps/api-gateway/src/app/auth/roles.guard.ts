import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true; // Si no hay @Roles, la ruta es pública para logueados

    const { user } = context.switchToHttp().getRequest();

    // Verificamos si el usuario tiene alguno de los roles permitidos
    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'No tienes permisos suficientes (Se requiere rol: ' +
          requiredRoles +
          ')',
      );
    }
    return true;
  }
}
