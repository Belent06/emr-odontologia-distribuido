import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración REST (Puerto 3008)
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3008;

  // 2. Configuración RabbitMQ (Listener)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'], // Ajustar si usas Docker service name en prod
      queue: 'audit_queue', // Cola específica para auditoría
      queueOptions: {
        durable: true,
      },
    },
  });

  // 3. Iniciar todo
  await app.startAllMicroservices();
  await app.listen(port);

  Logger.log(
    `🚀 Audit Service REST running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(`🐰 Audit Service listening on RabbitMQ queue: audit_queue`);
}

bootstrap();
