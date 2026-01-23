import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  // 👇 1. Definimos el Mock (simulacro)
  const mockAppService = {
    getData: jest.fn().mockReturnValue({ message: 'Hello API' }),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          // 👇 2. Inyectamos el Mock en lugar del Servicio Real
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      // Como mockeamos getData arriba, esto pasará
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });
});
