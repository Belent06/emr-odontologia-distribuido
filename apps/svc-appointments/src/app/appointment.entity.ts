import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 📅 Fecha y hora de la cita
  @Column({ type: 'timestamp' })
  date: Date;

  // 🩺 ID del Doctor (Viene del svc-auth / Postgres Usuarios)
  @Column()
  doctorId: string; // Guardamos el UUID del usuario doctor

  // 🤕 ID del Paciente (Viene del svc-patients / Mongo)
  @Column()
  patientId: string; // Guardamos el string ID de Mongo

  // 📝 Motivo de la consulta
  @Column({ nullable: true })
  reason: string;

  // 🚦 Estado de la cita
  // PENDING: Reservada pero no confirmada
  // CONFIRMED: Lista para atenderse
  // COMPLETED: Ya pasó
  // CANCELLED: Se canceló
  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
