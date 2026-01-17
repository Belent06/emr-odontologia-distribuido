import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importante
import { User } from './entities/user.entity'; // <--- Importante

@Module({
  imports: [
    // Esto permite que el servicio use @InjectRepository(User)
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Lo exportamos porque Auth lo necesitará luego para el Login
})
export class UsersModule {}
