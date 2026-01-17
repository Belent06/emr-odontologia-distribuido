import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true }) // Crea automáticamente createdAt y updatedAt
export class PatientHistory extends Document {
  @Prop({ required: true, unique: true })
  patientId: string; // El ID que viene de PostgreSQL

  @Prop({ required: true })
  patientName: string;

  @Prop({ default: [] })
  medicalNotes: { date: Date; content: string; doctorId: string }[];

  @Prop({ default: 'Abierto' })
  status: string;
}

export const PatientHistorySchema =
  SchemaFactory.createForClass(PatientHistory);
