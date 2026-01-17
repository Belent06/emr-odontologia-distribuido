import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string; // Nombre de usuario (ej: "dr_perez")

  @Column()
  password: string; // Contraseña encriptada (Hash)

  @Column({ default: true })
  isActive: boolean; // Para bloquear usuarios sin borrarlos

  // Guardamos los roles como un array simple (ej: "admin,dentist")
  @Column('simple-array', { default: 'user' })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
