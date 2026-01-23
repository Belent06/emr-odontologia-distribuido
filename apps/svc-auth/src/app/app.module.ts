import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // <--- Solo importamos el Módulo
import { User } from './users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5435,
      username: 'admin',
      password: 'adminpassword',
      database: 'emr_auth_db',
      entities: [User],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UsersModule,
    AuthModule, // <--- Aquí está la clave: Importamos el módulo ENTERO
  ],
  controllers: [], // <--- AQUÍ DEBE ESTAR VACÍO (Ni AuthController ni AppController)
  providers: [], // <--- AQUÍ DEBE ESTAR VACÍO (Ni AuthService ni AppService)
})
export class AppModule {}
