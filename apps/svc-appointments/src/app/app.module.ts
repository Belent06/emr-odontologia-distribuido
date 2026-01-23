import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Appointment } from './appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5436,
      username: 'admin',
      password: 'adminpassword',
      database: 'appointments_db',
      entities: [Appointment],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Appointment]),

    // 👇 CONFIGURACIÓN DE EMISORES RABBITMQ 👇
    ClientsModule.register([
      // 1. Cliente hacia HISTORIAL
      {
        name: 'HISTORY_SERVICE',
        transport: 5, // Es más limpio usar el Enum que el número 5
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'history_queue',
          queueOptions: { durable: false },
        },
      },
      // 👇 2. (NUEVO) Cliente hacia NOTIFICACIONES
      {
        name: 'NOTIFICATIONS_SERVICE', // Este nombre se usará en el @Inject del Service
        transport: 5,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'notifications_queue', // Debe coincidir con el main.ts de svc-notifications
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
