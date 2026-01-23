import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    HttpModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SECRET_KEY_SEGURA_123',
      signOptions: { expiresIn: '24h' },
    }),

    // 👇 CONFIGURACIÓN CORREGIDA PARA HISTORIAS 👇
    ClientsModule.register([
      {
        name: 'HISTORY_SERVICE',
        // 1. Usamos el número 5 si 'Transport.RABBITMQ' te da error de tipos
        transport: 5,
        options: {
          urls: ['amqp://localhost:5672'],
          // 2. ⚠️ CAMBIO CRÍTICO: Debe ser 'history_queue' para coincidir con svc-history
          queue: 'history_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
      // Si tienes otros microservicios por TCP, agrégalos aquí...
      {
        name: 'PATIENTS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3002 },
      },
      {
        name: 'APPOINTMENTS_SERVICE',
        transport: Transport.TCP,
        options: { host: 'localhost', port: 3003 },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
