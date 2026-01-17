import {
  IsString,
  IsEmail,
  MinLength,
  IsOptional,
  IsDateString,
} from 'class-validator';

// Interfaz pura (para el Frontend)
export interface IPatient {
  id: string;
  cedula: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  email: string;
  phone?: string;
  createdAt: Date;
}

// DTO para crear (Backend valida esto)
export class CreatePatientDto {
  @IsString()
  @MinLength(10, { message: 'La cédula debe tener 10 dígitos' })
  cedula!: string; // <--- MANTÉN EL SIGNO DE EXCLAMACIÓN

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsDateString({}, { message: 'La fecha debe ser formato YYYY-MM-DD' })
  birthDate!: string;

  @IsEmail({}, { message: 'El email no es válido' })
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

// DTO para actualizar (todo opcional)
export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
