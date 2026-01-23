import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  // 👇 MOCK DEL SERVICIO
  const mockAppService = {
    addEntryFromAppointment: jest.fn(),
    findAllByPatient: jest.fn(),
    createInitialHistory: jest.fn(),
    findAll: jest.fn(),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService, // 👈 Inyección del mock
        },
      ],
    }).compile();
  });

  describe('root', () => {
    it('should be defined', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController).toBeDefined();
    });
  });
});
