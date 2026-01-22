import {
  Injectable,
  Inject,
  InternalServerErrorException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileMetadata } from './file-metadata.entity';
import { S3_CLIENT_TOKEN } from './s3.provider';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService implements OnModuleInit {
  private bucketName = 'emr-files';
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @Inject(S3_CLIENT_TOKEN) private readonly s3Client: S3Client,
    @InjectRepository(FileMetadata)
    private readonly fileRepo: Repository<FileMetadata>,
  ) {}

  /**
   * 🛠️ AUTO-REPARACIÓN:
   * Al iniciar el módulo, verificamos si el bucket existe en MinIO/S3.
   * Si no existe (error 404), lo creamos automáticamente.
   */
  async onModuleInit() {
    this.logger.log(`🔧 Verificando bucket S3: '${this.bucketName}'...`);
    try {
      // Intentamos obtener metadatos del bucket para ver si existe
      await this.s3Client.send(
        new HeadBucketCommand({ Bucket: this.bucketName }),
      );
      this.logger.log(`✅ Bucket '${this.bucketName}' encontrado y listo.`);
    } catch (error) {
      this.logger.warn(
        `⚠️ El bucket '${this.bucketName}' no existe. Intentando crearlo...`,
      );
      try {
        await this.s3Client.send(
          new CreateBucketCommand({ Bucket: this.bucketName }),
        );
        this.logger.log(`✨ Bucket '${this.bucketName}' CREADO exitosamente.`);
      } catch (createError) {
        this.logger.error(
          `❌ Error fatal creando el bucket: ${createError.message}`,
        );
      }
    }
  }

  async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    patientId: string,
  ) {
    const uniqueId = uuidv4();
    // Estructura: patients/{id_paciente}/{uuid}-{nombre_archivo}
    const key = `patients/${patientId}/${uniqueId}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
    });

    try {
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300, // 5 minutos de vida para subir el archivo
      });
      return { uploadUrl, key, fileName, patientId };
    } catch (error) {
      console.error('S3 Error:', error);
      throw new InternalServerErrorException('Error generando URL de carga');
    }
  }

  async saveFileMetadata(data: any) {
    const newFile = this.fileRepo.create({
      s3Key: data.key,
      fileName: data.fileName,
      mimeType: data.mimeType,
      sizeBytes: data.size,
      patientId: data.patientId,
    });
    return await this.fileRepo.save(newFile);
  }

  async getFilesByPatient(patientId: string) {
    const files = await this.fileRepo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });

    // Generar URLs firmadas para ver las imagenes
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const command = new GetObjectCommand({
          Bucket: this.bucketName,
          Key: file.s3Key,
        });
        // URL válida por 1 hora para visualización
        const url = await getSignedUrl(this.s3Client, command, {
          expiresIn: 3600,
        });
        return { ...file, url };
      }),
    );
    return filesWithUrls;
  }
}
