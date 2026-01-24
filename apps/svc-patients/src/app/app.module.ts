import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    // 1. CONFIGURACIÓN DE BASE DE DATOS (HÍBRIDA)
    TypeOrmModule.forRoot({
      type: 'postgres',
      // 👇 AWS (Variable) o LOCAL (Túnel)
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 5433,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'PasswordSeguro123!',
      database: process.env.DB_DATABASE || 'patients_db', // Nombre exacto

      entities: [Patient],
      synchronize: true,
      autoLoadEntities: true,

      // 👇 SSL solo si estamos en AWS (Terraform enviará DB_SSL="true")
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),

    // 2. CONFIGURACIÓN DE CACHÉ (REDIS)
    // Nota: En AWS fallará si no tenemos Redis, pero intentaremos que arranque
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: 6379,
          },
          ttl: 60000,
        }),
      }),
    }),

    PatientsModule,

    // 4. SEGURIDAD (PASSPORT)
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
