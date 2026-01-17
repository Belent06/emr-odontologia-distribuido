import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Asegúrate de que esta ruta coincida con tu tsconfig (puede ser @emr-odontologia/shared-dtos o @emr/shared-dtos)
import { CreatePatientDto, UpdatePatientDto } from '@emr/shared-dtos';
import { Patient } from './entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      // 1. Crear la instancia convirtiendo la fecha explícitamente
      const patient = this.patientRepository.create({
        ...createPatientDto,
        birthDate: new Date(createPatientDto.birthDate), // <--- CORRECCIÓN CLAVE
      });

      // 2. Intentar guardar en Base de Datos
      return await this.patientRepository.save(patient);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOneBy({ id });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id); // Verifica si existe primero

    // Si viene fecha en la actualización, la convertimos también
    if (updatePatientDto.birthDate) {
      // Truco para que TypeScript no se queje al asignar Date a lo que antes era string en el DTO
      (updatePatientDto as any).birthDate = new Date(
        updatePatientDto.birthDate,
      );
    }

    try {
      this.patientRepository.merge(patient, updatePatientDto);
      return await this.patientRepository.save(patient);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }

  // --- MÉTODO PRIVADO PARA MANEJAR ERRORES ---
  private handleDBErrors(error: any): never {
    // El código '23505' en PostgreSQL significa "Violación de llave única" (Unique Constraint)
    // Esto pasa si intentas registrar una Cédula o Email que ya existen.
    if (error.code === '23505') {
      throw new BadRequestException(
        'El paciente ya existe (Verifica la cédula o el email)',
      );
    }

    console.error(error); // Imprimimos el error rojo en consola para que tú lo veas
    throw new InternalServerErrorException(
      'Error inesperado al procesar la solicitud',
    );
  }
}
