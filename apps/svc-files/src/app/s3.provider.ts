import { Provider } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

export const S3_CLIENT_TOKEN = 'S3_CLIENT';

export const S3Provider: Provider = {
  provide: S3_CLIENT_TOKEN,
  useFactory: () => {
    return new S3Client({
      region: 'us-east-1', // Dummy region for MinIO
      credentials: {
        accessKeyId: 'root', // Definido en docker-compose
        secretAccessKey: 'password123', // Definido en docker-compose
      },
      // Si estamos en local (Node ejecutándose en host), usamos localhost.
      // Si el servicio corriera dentro de Docker, usaríamos 'http://emr-minio:9000'
      endpoint: 'http://localhost:9000',
      forcePathStyle: true, // OBLIGATORIO para MinIO
    });
  },
};
