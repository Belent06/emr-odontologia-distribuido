import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
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

  async createInitialHistory(patientData: any) {
    try {
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
    } catch (error) {
      this.logger.error(`❌ Error al crear historia inicial: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    this.logger.log('🔍 [AppService] Iniciando búsqueda en MongoDB...');
    try {
      const histories = await this.historyModel.find().lean().exec();

      // 💡 TRUCO: Convertimos a string y luego a JSON para eliminar cualquier
      // rastro de tipos complejos de Mongoose que puedan trabar a RabbitMQ.
      const cleanData = JSON.parse(JSON.stringify(histories));

      this.logger.log(
        `✅ [AppService] Búsqueda finalizada. Documentos encontrados: ${cleanData.length}`,
      );
      return cleanData;
    } catch (error) {
      this.logger.error(
        `❌ [AppService] Error crítico en MongoDB: ${error.message}`,
      );
      return [];
    }
  }

  async addEntryFromAppointment(data: any) {
    try {
      this.logger.log(
        `📩 Recibiendo datos de cita para paciente: ${data.patientId}`,
      );

      let history = await this.historyModel.findOne({
        patientId: data.patientId,
      });

      if (!history) {
        this.logger.warn(
          `⚠️ No existía historial para ${data.patientId}. Creando uno nuevo...`,
        );
        history = new this.historyModel({
          patientId: data.patientId,
          patientName: 'Paciente (Generado por Cita)',
          medicalNotes: [],
        });
      }

      const newNote = {
        date: new Date(),
        content: `Cita Finalizada. Motivo: ${data.reason}. Detalles: ${data.notes || 'Sin notas adicionales'}`,
        doctorId: data.doctorId,
      };

      history.medicalNotes.push(newNote as any);
      const saved = await history.save();

      this.logger.log(
        `✅ Entrada médica agregada exitosamente para el paciente ${data.patientId}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`❌ Error al agregar entrada médica: ${error.message}`);
      throw error;
    }
  }
}
