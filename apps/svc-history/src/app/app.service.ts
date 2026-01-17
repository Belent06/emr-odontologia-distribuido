import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PatientHistory } from './schemas/patient-history.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(PatientHistory.name)
    private historyModel: Model<PatientHistory>,
  ) {}

  async createInitialHistory(patientData: any) {
    const newHistory = new this.historyModel({
      patientId: patientData.id,
      patientName: patientData.firstName || patientData.name, // Ajusta según tu DTO
      medicalNotes: [
        {
          date: new Date(),
          content: 'Expediente creado automáticamente por el sistema.',
          doctorId: 'SYSTEM',
        },
      ],
    });

    const saved = await newHistory.save();
    console.log(`💾 Historia guardada en MongoDB para: ${saved.patientName}`);
    return saved;
  }
}
