import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@localhost:5672'],
        queue: 'patients_queue',
        queueOptions: {
          durable: false,
        },
      },
    },
  );

  await app.listen();
  Logger.log('🚀 Microservicio de Historias Clínicas escuchando...');
}
bootstrap();
