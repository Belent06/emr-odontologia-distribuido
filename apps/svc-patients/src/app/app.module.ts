import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// IMPORTANTE: Fíjate que ahora importamos desde la carpeta './patients/...'
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435, // <--- CAMBIO CLAVE: Aquí ponemos 5435
      username: 'admin',
      password: 'adminpassword',
      database: 'emr_patients_db',
      entities: [Patient],
      synchronize: true,
      autoLoadEntities: true,
    }),
    PatientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
