import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',

      // 👇 MAGIA AQUÍ:
      // Si estoy en AWS (Terraform), uso DB_HOST.
      // Si estoy en local, uso 127.0.0.1 (Túnel).
      host: process.env.DB_HOST || '127.0.0.1',

      // Si estoy en AWS, uso 5432. En local, 5433 (Túnel).
      port: parseInt(process.env.DB_PORT) || 5433,

      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'PasswordSeguro123!',
      database: process.env.DB_DATABASE || 'auth_db',

      entities: [User],
      synchronize: true,
      autoLoadEntities: true,

      // 👇 SSL: Necesario tanto para el Túnel como para ECS conectando a RDS
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    UsersModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
