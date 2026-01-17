import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';

// 1. IMPORTAR LIBRERÍAS DE SEGURIDAD
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435, // Tu puerto correcto
      username: 'admin', // Tu usuario correcto
      password: 'adminpassword', // Tu password correcto
      database: 'emr_patients_db',
      entities: [Patient],
      synchronize: true,
      autoLoadEntities: true,
    }),
    PatientsModule,
    // 2. REGISTRAR EL MÓDULO PASSPORT
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [],
  providers: [
    // 3. REGISTRAR LA ESTRATEGIA COMO PROVEEDOR
    JwtStrategy,
  ],
})
export class AppModule {}
