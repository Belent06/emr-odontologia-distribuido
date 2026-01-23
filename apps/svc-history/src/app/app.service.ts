import { Injectable, Logger, Inject } from '@nestjs/common'; // 👈 Agregamos Inject
import { ClientProxy } from '@nestjs/microservices'; // 👈 Agregamos ClientProxy
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  private readonly logger = new Logger('AppService');

  private readonly dynamoDb = new DynamoDB.DocumentClient({
    region: 'us-east-1',
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
    credentials: {
      accessKeyId: 'fake',
      secretAccessKey: 'fake',
    },
  });

  private readonly tableName = 'emr-history-table';

  constructor(
    // 👇 INYECTAMOS EL CLIENTE DE AUDITORÍA
    @Inject('AUDIT_SERVICE') private readonly auditClient: ClientProxy,
  ) {}

  // 1. GUARDAR ENTRADA (Command)
  async addEntryFromAppointment(data: any) {
    this.logger.log(
      `📩 [DynamoDB] Persistiendo historial para: ${data.patientId}`,
    );

    const timestamp = new Date().toISOString();

    const item = {
      PK: `PACIENTE#${data.patientId}`,
      SK: `HISTORIAL#${timestamp}`,
      Type: 'MEDICAL_NOTE',
      AppointmentId: data.appointmentId || uuidv4(),
      DoctorId: data.doctorId,
      Reason: data.reason,
      Details: data.notes || 'Sin notas',
      CreatedAt: timestamp,
      PatientName: 'Paciente Referenciado',
    };

    try {
      await this.dynamoDb
        .put({
          TableName: this.tableName,
          Item: item,
        })
        .promise();

      this.logger.log('✅ Item guardado en DynamoDB correctamente');

      // 👇 AUDITAR: "Nota médica creada" (CRÍTICO)
      this.auditClient.emit('audit_event', {
        action: 'MEDICAL_HISTORY_CREATED',
        resourceId: data.patientId, // Identificamos al paciente afectado
        actor: 'system', // O data.doctorId si viene en el mensaje
        timestamp: new Date(),
        details: {
          reason: data.reason,
          appointmentId: item.AppointmentId,
          doctor: data.doctorId,
        },
      });

      return item;
    } catch (error) {
      this.logger.error(`❌ Error DynamoDB Put: ${error.message}`);
      throw error;
    }
  }

  // 2. BUSCAR POR PACIENTE (Query)
  async findAllByPatient(patientId: string) {
    this.logger.log(`🔍 [DynamoDB] Buscando historial de: ${patientId}`);

    const params = {
      TableName: this.tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `PACIENTE#${patientId}`,
      },
      ScanIndexForward: false,
    };

    try {
      const result = await this.dynamoDb.query(params).promise();

      // Opcional: Auditar lectura de historial (Access Log)
      // Si hay mucha carga, esto se suele evitar, pero para EMR es buena práctica.
      /*
      this.auditClient.emit('audit_event', {
         action: 'MEDICAL_HISTORY_ACCESSED',
         resourceId: patientId,
         actor: 'system',
         timestamp: new Date(),
         details: { recordsFound: result.Count }
      });
      */

      return result.Items;
    } catch (error) {
      this.logger.error(`❌ Error DynamoDB Query: ${error.message}`);
      return [];
    }
  }

  // 3. LEGACY SCAN
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

  async createInitialHistory(patientData: any) {
    this.logger.log(
      `ℹ️ [DynamoDB] Schemaless: No se requiere inicializar colección para ${patientData.id}`,
    );
    return { status: 'skipped' };
  }
}
