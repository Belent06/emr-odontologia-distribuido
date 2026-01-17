import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager'; // 👈 Importar CacheModule
import { redisStore } from 'cache-manager-redis-yet'; // 👈 Importar el store de Redis
import { PassportModule } from '@nestjs/passport';

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

    // 2. CONFIGURACIÓN DE CACHÉ (REDIS) - NUEVO
    // isGlobal: true permite que el caché se use en PatientsService sin volver a importarlo
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'localhost',
            port: 6379, // Puerto por defecto de Redis
          },
          // TTL (Time To Live): Cuánto tiempo viven los datos en caché (ej: 60 seg)
          ttl: 60000,
        }),
      }),
    }),

    PatientsModule,

    // 3. SEGURIDAD (PASSPORT)
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
