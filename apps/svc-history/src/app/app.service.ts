import { Injectable, Logger } from '@nestjs/common';
// 👇 Usamos el SDK de AWS en lugar de Mongoose
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');

  // 👇 CLIENTE DYNAMODB COMPATIBLE CON LOCAL Y NUBE
  private readonly dynamoDb = new DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
      accessKeyId: 'fake', // Dynamo Local acepta esto
      secretAccessKey: 'fake',
    },
  });

  private readonly tableName = 'emr-history-table'; // ⚠️ Debes crearla con el script init-dynamo.js

  // 1. GUARDAR ENTRADA (Command) - Viene de RabbitMQ
  async addEntryFromAppointment(data: any) {
    this.logger.log(
      `📩 [DynamoDB] Persistiendo historial para: ${data.patientId}`,
    );

    const timestamp = new Date().toISOString();

    // PATRÓN SINGLE-TABLE DESIGN
    const item = {
      PK: `PACIENTE#${data.patientId}`, // Partition Key
      SK: `HISTORIAL#${timestamp}`, // Sort Key
      Type: 'MEDICAL_NOTE',
      AppointmentId: data.appointmentId || uuidv4(),
      DoctorId: data.doctorId,
      Reason: data.reason,
      Details: data.notes || 'Sin notas',
      CreatedAt: timestamp,
      PatientName: 'Paciente Referenciado', // Dato desnormalizado
    };

    try {
      await this.dynamoDb
        .put({
          TableName: this.tableName,
          Item: item,
        })
        .promise();

      this.logger.log('✅ Item guardado en DynamoDB correctamente');
      return item;
    } catch (error) {
      this.logger.error(`❌ Error DynamoDB Put: ${error.message}`);
      throw error;
    }
  }

  // 2. BUSCAR POR PACIENTE (Query) - Optimizado
  // Este método reemplaza a la búsqueda general
  async findAllByPatient(patientId: string) {
    this.logger.log(`🔍 [DynamoDB] Buscando historial de: ${patientId}`);

    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `PACIENTE#${patientId}`,
      },
      ScanIndexForward: false, // false = Trae del más nuevo al más antiguo
    };

    try {
      const result = await this.dynamoDb.query(params).promise();
      return result.Items;
    } catch (error) {
      this.logger.error(`❌ Error DynamoDB Query: ${error.message}`);
      return [];
    }
  }

  // ⚠️ MÉTODO LEGACY: findAll() (Escaneo total)
  // Lo mantenemos TEMPORALMENTE para que tu API Gateway no falle si llama a "traer todo",
  // pero esto es ineficiente en producción.
  async findAll() {
    this.logger.warn(
      '⚠️ [DynamoDB] SCAN ejecutado. Esto es costoso en producción.',
    );
    try {
      const result = await this.dynamoDb
        .scan({ TableName: this.tableName })
        .promise();
      return result.Items;
    } catch (error) {
      return [];
    }
  }

  // Método legacy de inicialización (ya no es necesario en Dynamo, dejamos log)
  async createInitialHistory(patientData: any) {
    this.logger.log(
      `ℹ️ [DynamoDB] Schemaless: No se requiere inicializar colección para ${patientData.id}`,
    );
    return { status: 'skipped' };
  }
}
