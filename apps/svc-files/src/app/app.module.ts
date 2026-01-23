import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // 👈 Importar
import { FilesController } from './app.controller';
import { FilesService } from './app.service';
import { S3Provider } from './s3.provider';
import { FileMetadata } from './file-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5437,
      username: 'admin',
      password: 'adminpassword',
      database: 'files_db',
      entities: [FileMetadata],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([FileMetadata]),

    // 👇 CONFIGURACIÓN DE AUDITORÍA
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE', // Nombre para inyección
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // RabbitMQ local
          queue: 'audit_queue', // Misma cola que escucha svc-audit
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
