import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 1. CORS ACTIVADO
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // 2. PUERTO CAMBIADO A 3333
  const port = process.env.PORT || 3333;

  await app.listen(port);
  Logger.log(
    `🚀 svc-patients is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
