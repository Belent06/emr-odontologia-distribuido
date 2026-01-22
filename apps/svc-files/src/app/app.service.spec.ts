import { Test, TestingModule } from '@nestjs/testing';

// 👇 SOLUCIÓN MÁGICA: Mockeamos 'uuid' ANTES de los imports.
// Esto evita que Jest intente leer el archivo que causa el error "Unexpected token export".
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

import { FilesService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileMetadata } from './file-metadata.entity';
import { S3_CLIENT_TOKEN } from './s3.provider';

describe('FilesService', () => {
  let service: FilesService;

  // Mock de TypeORM
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  // Mock de S3
  const mockS3Client = {
    send: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(FileMetadata),
          useValue: mockRepository,
        },
        {
          provide: S3_CLIENT_TOKEN,
          useValue: mockS3Client,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
