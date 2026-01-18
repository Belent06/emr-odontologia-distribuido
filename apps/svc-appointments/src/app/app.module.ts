import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Appointment } from './appointment.entity'; // 👈 1. Importar

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5436,
      username: 'admin',
      password: 'adminpassword',
      database: 'appointments_db',
      entities: [Appointment], // 👈 2. Registrar aquí la entidad
      synchronize: true, // Esto creará la tabla 'appointment' automáticamente
    }),
    // 👇 3. También necesitamos esto para usar Repository<Appointment> en el servicio
    TypeOrmModule.forFeature([Appointment]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
