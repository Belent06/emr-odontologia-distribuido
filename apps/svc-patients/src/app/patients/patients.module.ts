import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),

    ClientsModule.register([
      // 1. Cliente existente (NO TOCAR)
      {
        name: 'HISTORY_SERVICE',
        transport: 5,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'history_queue',
          queueOptions: { durable: false },
        },
      },
      // 2. 👇 NUEVO: Cliente para Auditoría
      {
        name: 'AUDIT_SERVICE', // Nombre para inyectar
        transport: 5,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'audit_queue', // Misma cola que definimos en svc-audit
          queueOptions: { durable: true }, // Logs persistentes
        },
      },
    ]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
