import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException, // 👈 1. Agregamos esto para manejar IDs incorrectos
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  // 1. Ver todas las citas
  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      order: { date: 'ASC' },
    });
  }

  // 2. Crear una Cita con Validaciones de Solapamiento
  async create(data: any): Promise<Appointment> {
    const appointmentDate = new Date(data.date);

    // --- 🛡️ VALIDACIÓN 0: Fecha en el Futuro ---
    if (appointmentDate < new Date()) {
      throw new BadRequestException('No puedes agendar citas en el pasado');
    }

    // --- 🛡️ VALIDACIÓN 1: Disponibilidad del Doctor ---
    const doctorBusy = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId: data.doctorId })
      .andWhere('appointment.date = :date', { date: appointmentDate })
      .andWhere('appointment.status != :status', { status: 'CANCELLED' })
      .getOne();

    if (doctorBusy) {
      throw new ConflictException(
        'El doctor ya tiene una cita agendada a esa hora',
      );
    }

    // --- 🛡️ VALIDACIÓN 2: Disponibilidad del Paciente ---
    const patientBusy = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .where('appointment.patientId = :patientId', {
        patientId: data.patientId,
      })
      .andWhere('appointment.date = :date', { date: appointmentDate })
      .andWhere('appointment.status != :status', { status: 'CANCELLED' })
      .getOne();

    if (patientBusy) {
      throw new ConflictException(
        'El paciente ya tiene otra cita a esa misma hora',
      );
    }

    // --- ✅ SI PASA TODAS LAS VALIDACIONES, GUARDAMOS ---
    const newAppointment = this.appointmentRepo.create({
      date: appointmentDate,
      doctorId: data.doctorId,
      patientId: data.patientId,
      reason: data.reason,
      status: 'PENDING',
    });

    return this.appointmentRepo.save(newAppointment);
  }

  // 👇 3. NUEVO MÉTODO: Cambiar Estatus (CANCELLED, COMPLETED, etc.)
  async updateStatus(id: string, status: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    appointment.status = status;
    return this.appointmentRepo.save(appointment);
  }
}
