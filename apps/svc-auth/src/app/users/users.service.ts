import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  OnModuleInit, // 👈 1. Importamos esto
  Logger, // 👈 2. Importamos esto para logs bonitos
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  // 👈 3. Implementamos la interfaz
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 👇 4. LÓGICA DE LA SEMILLA (SEED)
  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    try {
      // Verificamos si la tabla está vacía
      const count = await this.userRepository.count();

      if (count === 0) {
        this.logger.log(
          '🌱 Base de datos vacía detectada. Creando usuario Doctor Admin...',
        );

        const adminPassword = 'password123';
        const adminEmail = 'doctor@test.com';

        const admin = this.userRepository.create({
          email: adminEmail,
          username: adminEmail, // Respetamos tu fix crítico: username = email
          password: bcrypt.hashSync(adminPassword, 10),
          name: 'Doctor Admin',
          roles: ['admin', 'doctor'], // Roles por defecto
          isActive: true, // Asumimos que tienes este campo, si no, bórralo
        });

        await this.userRepository.save(admin);
        this.logger.log(`✅ Usuario Creado: ${adminEmail} / ${adminPassword}`);
      } else {
        this.logger.log(
          'ℹ️ La base de datos ya tiene usuarios. Saltando Seed.',
        );
      }
    } catch (error) {
      this.logger.error('❌ Error ejecutando el Seed', error);
    }
  }
  // ---------------------------------------------------------

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'roles', 'name'],
    });
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, email, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        email,
        username: email, // Tu FIX CRÍTICO
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);
      delete user.password;
      return user;
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  // --- Métodos estándar (CRUD) ---

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  async findOneByUsername(username: string) {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException('El nombre de usuario (o email) ya existe');
    }
    console.log(error);
    throw new InternalServerErrorException(
      'Error al crear usuario - Revise logs',
    );
  }
}
