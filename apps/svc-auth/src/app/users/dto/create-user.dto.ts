import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(4)
  username: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  // Opcional: Podríamos pedir roles aquí, pero por seguridad
  // lo manejaremos en el servicio por defecto como 'user'.
}
