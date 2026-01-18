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

  // 1. Crear historia inicial (Lo que ya tenías)
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

  // 2. BUSCAR TODAS LAS HISTORIAS (Nuevo método para el Gateway) 🚀
  async findAll() {
    this.logger.log('🔍 Consultando todas las historias en MongoDB...');
    // Buscamos todos los registros en la colección de historias
    return this.historyModel.find().exec();
  }
}
