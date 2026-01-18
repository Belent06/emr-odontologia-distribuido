import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices'; // 👈 Importar estos
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

    // 👇 REGISTRAMOS EL CLIENTE DE RABBITMQ PARA HISTORIAS 👇
    ClientsModule.register([
      {
        name: 'HISTORY_SERVICE', // Nombre para inyectar en el servicio
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          queue: 'patients_queue', // ⚠️ Debe ser igual al de svc-history
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
