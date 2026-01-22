import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './app.controller';
import { FilesService } from './app.service';
import { S3Provider } from './s3.provider';
import { FileMetadata } from './file-metadata.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Apunta al localhost porque corremos el servicio desde la terminal
      port: 5437, // Puerto mapeado en el docker-compose para files_db
      username: 'admin',
      password: 'adminpassword',
      database: 'files_db',
      entities: [FileMetadata],
      synchronize: true, // Solo desarrollo
    }),
    TypeOrmModule.forFeature([FileMetadata]),
  ],
  controllers: [FilesController],
  providers: [FilesService, S3Provider],
})
export class AppModule {}
