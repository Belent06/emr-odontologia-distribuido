import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Mantenemos ClientsModule para que RabbitMQ siga funcionando
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    // 👇 CONFIGURACIÓN DE RABBITMQ (INTACTA) 👇
    ClientsModule.register([
      {
        name: 'HISTORY_SERVICE',
        transport: 5, // Transport.RMQ
        options: {
          urls: ['amqp://localhost:5672'], // Docker local
          queue: 'history_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
