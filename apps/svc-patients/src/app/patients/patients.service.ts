import {
  BadRequestException,
  Injectable,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePatientDto, UpdatePatientDto } from '@emr/shared-dtos';
import { Patient } from './entities/patient.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager'; // 👈 Asegúrate de que esté
import { Cache } from 'cache-manager';

@Injectable()
export class PatientsService {
  private readonly CACHE_KEY = 'patients_list'; // Nombre de la "llave" en Redis

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @Inject('PATIENT_SERVICE')
    private readonly client: ClientProxy,

    // 👇 INYECTAMOS EL MANEJADOR DE CACHÉ 👇
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    try {
      const patient = this.patientRepository.create({
        ...createPatientDto,
        birthDate: new Date(createPatientDto.birthDate),
      });

      const savedPatient = await this.patientRepository.save(patient);

      // 📣 Evento RabbitMQ
      this.client.emit('patient_created', savedPatient);

      // 🧹 INVALIDAR CACHÉ: Borramos la lista vieja porque hay un nuevo paciente
      await this.cacheManager.del(this.CACHE_KEY);

      return savedPatient;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async findAll(): Promise<Patient[]> {
    // 1. Intentar obtener de Redis
    const cachedPatients = await this.cacheManager.get<Patient[]>(
      this.CACHE_KEY,
    );

    if (cachedPatients) {
      console.log('⚡ [REDIS] Retornando lista desde Caché');
      return cachedPatients;
    }

    // 2. Si no existe, ir a Postgres
    console.log('📦 [POSTGRES] Consultando Base de Datos...');
    const patients = await this.patientRepository.find();

    // 3. Guardar en Redis por 60 segundos (60000 ms)
    await this.cacheManager.set(this.CACHE_KEY, patients, 60000);

    return patients;
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
    const patient = await this.findOne(id);

    if (updatePatientDto.birthDate) {
      (updatePatientDto as any).birthDate = new Date(
        updatePatientDto.birthDate,
      );
    }

    try {
      this.patientRepository.merge(patient, updatePatientDto);
      const updatedPatient = await this.patientRepository.save(patient);

      // 🧹 INVALIDAR CACHÉ: Al actualizar, la lista vieja ya no sirve
      await this.cacheManager.del(this.CACHE_KEY);

      return updatedPatient;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);

    // 🧹 INVALIDAR CACHÉ: El paciente eliminado ya no debe aparecer en la lista
    await this.cacheManager.del(this.CACHE_KEY);
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('El paciente ya existe');
    }
    console.error(error);
    throw new InternalServerErrorException('Error inesperado');
  }
}
