import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // 1. Crear la App Híbrida (HTTP + WebSocket)
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para que React pueda conectar el Socket
  app.enableCors();

  // 2. Conectar el Microservicio (RabbitMQ)
  app.connectMicroservice<MicroserviceOptions>({
    transport: 5,
    options: {
      urls: ['amqp://localhost:5672'], // Asegúrate que este puerto coincida con tu docker-compose (suele ser 5672)
      queue: 'notifications_queue', // 👈 IMPORTANTE: Nombre de cola ÚNICO para este servicio
      queueOptions: {
        durable: false,
      },
    },
  });

  // 3. Iniciar ambos
  await app.startAllMicroservices();
  const port = 3006; // Puerto para el servidor WebSocket
  await app.listen(port);

  Logger.log(`🚀 svc-notifications is running on: http://localhost:${port}`);
  Logger.log(`🐰 Connected to RabbitMQ queue: notifications_queue`);
}

bootstrap();
