import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Inject, // 👈 1. Necesario para inyectar el cliente
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices'; // 👈 2. Necesario para tipar el cliente
import { Appointment } from './appointment.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,

    // 👇 3. INYECTAMOS EL CLIENTE RABBITMQ (Debe coincidir con el nombre en app.module)
    @Inject('HISTORY_SERVICE') private readonly historyClient: ClientProxy,
  ) {}

  // 1. Ver todas las citas
  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      order: { date: 'ASC' },
    });
  }

  // 2. Crear una Cita con Validaciones
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

    // --- ✅ GUARDAR ---
    const newAppointment = this.appointmentRepo.create({
      date: appointmentDate,
      doctorId: data.doctorId,
      patientId: data.patientId,
      reason: data.reason,
      status: 'PENDING',
    });

    return this.appointmentRepo.save(newAppointment);
  }

  // 👇 3. MÉTODO EDITADO: Disparar evento al completar
  async updateStatus(id: string, status: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });

    if (!appointment) {
      throw new NotFoundException('Cita no encontrada');
    }

    appointment.status = status;
    const updatedAppointment = await this.appointmentRepo.save(appointment);

    // 🚀 EVENTO: Si la cita se completó, avisamos a History por RabbitMQ
    if (status === 'COMPLETED') {
      console.log(
        `🚀 [APPOINTMENTS-SVC] Cita ${id} completada. Enviando evento a History...`,
      );

      this.historyClient.emit('appointment_completed', {
        appointmentId: updatedAppointment.id,
        patientId: updatedAppointment.patientId,
        doctorId: updatedAppointment.doctorId,
        date: updatedAppointment.date,
        reason: updatedAppointment.reason,
        notes: 'Cita finalizada exitosamente',
      });
    }

    return updatedAppointment;
  }
}
