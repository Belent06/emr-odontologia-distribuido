import { Test, TestingModule } from '@nestjs/testing';
import { FilesService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileMetadata } from './file-metadata.entity';
import { S3_CLIENT_TOKEN } from './s3.provider';

// 👇 1. ESTA ES LA SOLUCIÓN AL ERROR DE "Unexpected token 'export'"
// Al poner esto, Jest usa esta función falsa y no lee la librería uuid real.
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        // 👇 2. Mock de S3 (Para evitar error de dependencia S3_CLIENT_TOKEN)
        {
          provide: S3_CLIENT_TOKEN,
          useValue: {
            send: jest.fn().mockResolvedValue({}),
          },
        },
        // 👇 3. Mock del Repositorio (Para evitar error de TypeORM)
        {
          provide: getRepositoryToken(FileMetadata),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        // 👇 4. Mock de Auditoría (Para evitar error de AUDIT_SERVICE)
        {
          provide: 'AUDIT_SERVICE',
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
