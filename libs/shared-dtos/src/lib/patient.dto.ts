import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

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
  cedula!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsDateString()
  birthDate!: string; // Se recibe como ISO String YYYY-MM-DD

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
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
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
