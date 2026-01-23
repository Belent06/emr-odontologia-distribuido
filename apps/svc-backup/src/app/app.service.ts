import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { Client } from 'pg';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private s3Client: S3Client;

  private readonly BUCKET_NAME = 'emr-backups';

  constructor() {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
      credentials: {
        accessKeyId: 'root',
        secretAccessKey: 'password123',
      },
      forcePathStyle: true,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      this.logger.log(
        `🔍 Verificando existencia del bucket: '${this.BUCKET_NAME}'...`,
      );
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.BUCKET_NAME }),
      );
      this.logger.log(`✅ Bucket '${this.BUCKET_NAME}' verificado.`);
    } catch (_error) {
      // 👈 FIX LINT: Usamos _error o quitamos la variable si no se usa
      this.logger.warn(
        `⚠️ Bucket '${this.BUCKET_NAME}' no encontrado. Intentando crear...`,
      );
      try {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.BUCKET_NAME }),
        );
        this.logger.log(`✨ Bucket '${this.BUCKET_NAME}' creado exitosamente.`);
      } catch (createError) {
        this.logger.error(`❌ Error fatal creando bucket.`, createError);
      }
    }
  }

  getHealth() {
    return { status: 'UP', service: 'svc-backup', timestamp: new Date() };
  }

  // 👇 CAMBIO FINAL: Backup diario a medianoche (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('🔄 Ejecutando Backup de Bases de Datos...');
    const timestamp = new Date().toISOString().replace(/:/g, '-');

    try {
      // --- A. AUTH DB ---
      const users = await this.fetchDataFromDB(
        5435,
        'emr_auth_db',
        'SELECT id, email, username, name, roles, "isActive" FROM "users"',
      );

      // --- B. APPOINTMENTS DB ---
      const appointments = await this.fetchDataFromDB(
        5436,
        'appointments_db',
        'SELECT * FROM appointment',
      );

      // --- C. PAYLOAD ---
      const backupPayload = {
        meta: {
          type: 'FULL_LOGICAL_BACKUP',
          generatedAt: new Date().toISOString(),
          environment: 'local-docker',
        },
        data: {
          auth_users: { count: users.length, rows: users },
          appointments: { count: appointments.length, rows: appointments },
        },
      };

      // --- D. SUBIDA ---
      const fileName = `backup-${timestamp}.json`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: fileName,
          Body: JSON.stringify(backupPayload, null, 2),
          ContentType: 'application/json',
        }),
      );

      this.logger.log(
        `✅ Backup completado exitosamente: ${this.BUCKET_NAME}/${fileName} (Users: ${users.length}, Appts: ${appointments.length})`,
      );
    } catch (error) {
      this.logger.error('❌ Error durante el proceso de backup:', error);
    }
  }

  // --- HELPER SQL ---
  private async fetchDataFromDB(port: number, database: string, query: string) {
    const client = new Client({
      user: 'admin',
      host: 'localhost',
      database: database,
      password: 'adminpassword',
      port: port,
    });

    try {
      await client.connect();
      const res = await client.query(query);
      return res.rows;
    } catch (error) {
      this.logger.error(
        `⚠️ Error leyendo DB ${database} (Puerto ${port})`,
        error,
      );
      return [];
    } finally {
      // 👇 FIX LINT: Agregamos un comentario dentro de la función vacía
      await client.end().catch(() => {
        /* silent close */
      });
    }
  }
}
