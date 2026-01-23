import { Logger, ValidationPipe } from '@nestjs/common'; // Asegúrate de importar ValidationPipe si lo usas
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 1. CORS ACTIVADO (Vital para el Login desde React)
  app.enableCors();

  const port = process.env.PORT || 3000; // Este se queda en 3000

  await app.listen(port);
  Logger.log(
    `🚀 svc-auth is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
