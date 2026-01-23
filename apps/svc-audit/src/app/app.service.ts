import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  DynamoDBClient,
  CreateTableCommand,
  ListTablesCommand,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private dynamoClient: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;

  private readonly TABLE_NAME = 'AuditLogs';

  constructor() {
    // 1. Configuración Cliente (Igual a tu svc-history)
    this.dynamoClient = new DynamoDBClient({
      region: 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
      credentials: {
        accessKeyId: 'fake',
        secretAccessKey: 'fake',
      },
    });

    this.docClient = DynamoDBDocumentClient.from(this.dynamoClient);
  }

  async onModuleInit() {
    await this.ensureTableExists();
  }

  // 2. Crear tabla si no existe (Lazy Creation)
  private async ensureTableExists() {
    try {
      const listCmd = new ListTablesCommand({});
      const { TableNames } = await this.dynamoClient.send(listCmd);

      if (!TableNames?.includes(this.TABLE_NAME)) {
        this.logger.warn(`⚠️ Tabla '${this.TABLE_NAME}' no existe. Creando...`);
        await this.dynamoClient.send(
          new CreateTableCommand({
            TableName: this.TABLE_NAME,
            KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }], // Partition Key
            AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
          }),
        );
        this.logger.log(`✅ Tabla '${this.TABLE_NAME}' creada en DynamoDB.`);
      } else {
        this.logger.log(`✅ Tabla '${this.TABLE_NAME}' verificada.`);
      }
    } catch (error) {
      this.logger.error('❌ Error verificando DynamoDB:', error);
    }
  }

  getHealth() {
    return { status: 'UP', service: 'svc-audit', db: 'DynamoDB' };
  }

  // 3. Guardar Log (Insertar Item)
  async createAuditLog(data: any) {
    const logItem = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...data, // Guardamos todo lo que venga en el evento
    };

    try {
      await this.docClient.send(
        new PutCommand({
          TableName: this.TABLE_NAME,
          Item: logItem,
        }),
      );
      this.logger.log(
        `📝 Audit Log guardado: ${data.action || 'Unknown Event'}`,
      );
    } catch (error) {
      this.logger.error('❌ Error guardando log en DynamoDB:', error);
    }
  }

  // 4. Ver Logs (Endpoint opcional para Admin)
  async getLogs() {
    try {
      const result = await this.docClient.send(
        new ScanCommand({
          TableName: this.TABLE_NAME,
          Limit: 20, // Solo los ultimos 20 para no explotar
        }),
      );
      return result.Items;
    } catch (error) {
      return [];
    }
  }
}
