import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { PassportModule } from '@nestjs/passport';
import { PatientsModule } from './patients/patients.module';
import { Patient } from './patients/entities/patient.entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    // 1. CONFIGURACIÓN DE BASE DE DATOS (HÍBRIDA)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT) || 5433,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'PasswordSeguro123!',
      database: process.env.DB_DATABASE || 'patients_db',
      entities: [Patient],
      synchronize: true,
      autoLoadEntities: true,
      ssl:
        process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),

    // 2. CONFIGURACIÓN DE CACHÉ (REDIS)
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            // 👇 DNS interno de AWS o localhost
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
          },
          ttl: 60000,
        }),
      }),
    }),

    PatientsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
