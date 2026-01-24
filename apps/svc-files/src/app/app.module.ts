import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { FilesController } from './app.controller';
import { FilesService } from './app.service';
import { S3Provider } from './s3.provider';
import { FileMetadata } from './file-metadata.entity';

@Module({
  imports: [
    // 👇 CONFIGURACIÓN BASE DE DATOS (HÍBRIDA)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 5433,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'PasswordSeguro123!',
      database: process.env.DB_DATABASE || 'files_db', // Nombre correcto

      entities: [FileMetadata],
      synchronize: true,

      // 👇 SSL Dinámico
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    TypeOrmModule.forFeature([FileMetadata]),

    // 👇 CONFIGURACIÓN DE AUDITORÍA (RABBITMQ)
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          // Preparamos para recibir URL de AWS o usar local
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'audit_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [FilesController],
  providers: [FilesService, S3Provider],
})
export class AppModule {}
