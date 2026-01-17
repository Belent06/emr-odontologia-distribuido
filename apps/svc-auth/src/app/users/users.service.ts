import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      // 1. Extraemos email y password explícitamente
      const { password, email, ...userData } = createUserDto;

      // 2. Creamos la entidad
      const user = this.userRepository.create({
        ...userData,
        email, // Guardamos el email
        // ---> FIX CRÍTICO AQUÍ <---
        username: email, // Usamos el email como username para satisfacer a la BD
        // -------------------------
        password: bcrypt.hashSync(password, 10),
      });

      // 3. Guardar en base de datos
      await this.userRepository.save(user);

      // 4. Limpiar la respuesta (¡NUNCA devolver la contraseña!)
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
    // Implementaremos esto mejor luego
    return `This action returns a #${id} user`;
  }

  // Método auxiliar para buscar por nombre de usuario (Vital para el Login)
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

  // Manejo de errores centralizado
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
