import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('files')
export class FileMetadata {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  s3Key: string;

  @Column()
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  sizeBytes: number;

  @Column()
  patientId: string;

  @CreateDateColumn()
  createdAt: Date;
}
