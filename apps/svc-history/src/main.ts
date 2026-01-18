import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      // Usamos el mismo transporte (Si te da error de tipos usa el número 5)
      transport: 5,
      options: {
        // Asegúrate que la URL sea la misma que en svc-appointments
        urls: ['amqp://localhost:5672'],

        // 👇 AQUÍ ESTABA EL ERROR: Cambiamos 'patients_queue' por 'history_queue'
        queue: 'history_queue',

        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  Logger.log(
    '🚀 Microservicio de Historias Clínicas escuchando en history_queue...',
  );
}
bootstrap();
