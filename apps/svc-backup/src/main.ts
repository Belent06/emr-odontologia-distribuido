import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo estándar
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Puerto 3007 para Backup Service
  const port = process.env.PORT || 3007;

  await app.listen(port);
  Logger.log(
    `🚀 svc-backup corriendo en: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
