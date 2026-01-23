import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      // 1. Configuración existente (NO TOCAR)
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
        name: 'AUDIT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'audit_queue', // Misma cola que svc-audit
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
