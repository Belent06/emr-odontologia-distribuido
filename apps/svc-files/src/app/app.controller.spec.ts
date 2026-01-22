import { Test, TestingModule } from '@nestjs/testing';

// 👇 Prevenimos el error de 'uuid' también aquí
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

import { FilesController } from './app.controller';
import { FilesService } from './app.service';

describe('FilesController', () => {
  let controller: FilesController;

  // Mock del Servicio completo
  const mockFilesService = {
    generatePresignedUploadUrl: jest.fn().mockResolvedValue({
      uploadUrl: 'http://mock-url',
      key: 'mock-key',
    }),
    saveFileMetadata: jest.fn().mockResolvedValue({ id: '1' }),
    getFilesByPatient: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
