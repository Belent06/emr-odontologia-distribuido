import { SetMetadata } from '@nestjs/common';

// Este decorador nos permitirá poner @Roles('admin') en las rutas
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
