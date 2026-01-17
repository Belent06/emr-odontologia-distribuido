import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // --- CONFIGURACIÓN CORREGIDA ---

  // 1. AUTH: El proxy recibirá /login y lo pegará a /api/auth -> /api/auth/login
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://localhost:3000/api/auth',
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '', // Esto asegura que no se duplique el path
      },
    }),
  );

  // 2. PATIENTS: El proxy recibirá / y lo pegará a /api/patients
  app.use(
    '/api/patients',
    createProxyMiddleware({
      target: 'http://localhost:3333/api/patients',
      changeOrigin: true,
      pathRewrite: {
        '^/api/patients': '',
      },
    }),
  );

  // 3. HISTORY
  app.use(
    '/api/history',
    createProxyMiddleware({
      target: 'http://localhost:3334/api/history',
      changeOrigin: true,
      pathRewrite: {
        '^/api/history': '',
      },
    }),
  );

  const port = 3080;
  await app.listen(port);
  Logger.log(`🚀 API Gateway running on: http://localhost:${port}`);
}

bootstrap();
