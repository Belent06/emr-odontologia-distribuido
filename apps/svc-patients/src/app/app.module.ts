import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices'; // 👈 Importar esto

import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    // 1. CONFIGURACIÓN DE BASE DE DATOS (POSTGRES)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'admin',
      password: 'adminpassword',
      database: 'emr_patients_db',
      entities: [Patient],
      synchronize: true,
      autoLoadEntities: true,
    }),

    // 2. CONFIGURACIÓN DE CACHÉ (REDIS)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379,
          },
          ttl: 60000,
        }),
      }),
    }),

    // 👇 3. REGISTRAMOS EL CLIENTE DE RABBITMQ PARA HISTORIAS
    // Lo registramos aquí para que esté disponible en todo el microservicio

    PatientsModule,

    // 4. SEGURIDAD (PASSPORT)
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
