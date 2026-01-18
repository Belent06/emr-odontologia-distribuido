import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientHistory } from './schemas/patient-history.schema';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');

  constructor(
    @InjectModel(PatientHistory.name)
    private historyModel: Model<PatientHistory>,
  ) {}

  // 1. Crear historia inicial (Tu código original - Intacto)
  async createInitialHistory(patientData: any) {
    const newHistory = new this.historyModel({
      patientId: patientData.id,
      patientName: patientData.firstName || patientData.name,
      medicalNotes: [
        {
          date: new Date(),
          content: 'Expediente creado automáticamente por el sistema.',
          doctorId: 'SYSTEM',
        },
      ],
    });

    const saved = await newHistory.save();
    this.logger.log(
      `💾 Historia guardada en MongoDB para: ${saved.patientName}`,
    );
    return saved;
  }

  // 2. BUSCAR TODAS LAS HISTORIAS (Tu código original - Intacto)
  async findAll() {
    this.logger.log('🔍 Consultando todas las historias en MongoDB...');
    return this.historyModel.find().exec();
  }

  // 👇 3. NUEVO MÉTODO AGREGADO: Procesa el evento de Cita Completada 🚀
  async addEntryFromAppointment(data: any) {
    this.logger.log(
      `📩 Recibiendo datos de cita para paciente: ${data.patientId}`,
    );

    // A. Buscamos el historial existente
    let history = await this.historyModel.findOne({
      patientId: data.patientId,
    });

    // B. Si NO existe (ej. pacientes viejos), lo creamos al vuelo (Fail-safe)
    if (!history) {
      this.logger.warn(
        `⚠️ No existía historial para ${data.patientId}. Creando uno nuevo...`,
      );
      history = new this.historyModel({
        patientId: data.patientId,
        patientName: 'Paciente (Generado por Cita)', // No tenemos el nombre aquí, ponemos un placeholder
        medicalNotes: [],
      });
    }

    // C. Creamos la nota médica basada en la cita
    const newNote = {
      date: new Date(),
      content: `Cita Finalizada. Motivo: ${data.reason}. Detalles: ${data.notes || 'Sin notas adicionales'}`,
      doctorId: data.doctorId,
    };

    // D. Empujamos al array 'medicalNotes' (que es como se llama en tu esquema)
    // Usamos 'any' temporalmente si TypeScript se queja del tipo estricto,
    // pero idealmente tu Schema ya define esta estructura.
    history.medicalNotes.push(newNote as any);

    const saved = await history.save();
    this.logger.log(
      `✅ Entrada médica agregada exitosamente para el paciente ${data.patientId}`,
    );
    return saved;
  }
}
