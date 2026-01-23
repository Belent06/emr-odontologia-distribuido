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
  email: string;

  @Column({ unique: true })
  username: string;

  // 🛡️ 'select: false' evita que el hash de la contraseña se envíe por accidente en listas públicas
  @Column({ select: false })
  password: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  // 🔑 Guardamos roles como array para manejar permisos múltiples (admin, doctor, etc.)
  @Column('simple-array', { default: 'user' })
  roles: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
