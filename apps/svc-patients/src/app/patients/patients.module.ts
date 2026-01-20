import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // 👈 Importante
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';

@Module({
  imports: [
    // 1. Conexión con la tabla de Postgres
    TypeOrmModule.forFeature([Patient]),

    // 2. Registro del cliente de RabbitMQ AQUÍ ADENTRO 👈
    ClientsModule.register([
      {
        name: 'HISTORY_SERVICE', // Este nombre debe ser IGUAL al @Inject del servicio
        transport: 5, // 5 es Transport.RABBITMQ
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'history_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService], // Opcional
})
export class PatientsModule {}
