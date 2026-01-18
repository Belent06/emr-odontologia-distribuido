import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; // 👈 1. Importamos ClientsModule
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

    // 👇 2. CONFIGURACIÓN DEL EMISOR RABBITMQ 👇
    // Esto permite que este microservicio envíe mensajes a la cola 'history_queue'
    ClientsModule.register([
      {
        name: 'HISTORY_SERVICE', // Nombre que usaremos para inyectar en el servicio (@Inject)
        transport: 5,
        options: {
          urls: ['amqp://localhost:5672'], // URL de tu RabbitMQ (Docker)
          queue: 'history_queue', // La cola que escucha svc-history
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
