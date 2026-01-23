import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Prefijo Global (/api)
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 2. CORS (Para que funcione con tu Frontend Angular/React)
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // ❌ ELIMINAMOS TODOS LOS "app.use(createProxyMiddleware...)"
  // Ya no los necesitas porque tu AppService y AppController hacen ese trabajo
  // de forma más inteligente y segura.

  // 3. Puerto
  // Nota: Veo que usas el 3080. Asegúrate de que en Postman uses este puerto.
  const port = process.env.PORT || 3080;
  await app.listen(port);

  Logger.log(
    `🚀 API Gateway running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
