import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// 👇 1. Importamos ClientsModule y Transport
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'SECRET_KEY_SEGURA_123',
      signOptions: { expiresIn: '1h' },
    }),
    // 👇 2. Registramos el cliente para hablar con svc-audit
    ClientsModule.register([
      {
        name: 'AUDIT_SERVICE', // Nombre que usaremos en el @Inject
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // URL de RabbitMQ
          queue: 'audit_queue', // Debe coincidir con la cola de svc-audit
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
