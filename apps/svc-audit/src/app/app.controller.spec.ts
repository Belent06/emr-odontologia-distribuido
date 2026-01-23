import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 👇 MOCK DE UUID (Necesario aquí también para evitar el error al importar AppService)
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          // Simulamos el servicio completo para aislar el test del controlador
          useValue: {
            getHealth: jest.fn().mockReturnValue({ status: 'UP' }),
            getLogs: jest.fn().mockResolvedValue([]),
            createAuditLog: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // Test corregido para usar health() en lugar de getData()
  describe('health', () => {
    it('should return health status', () => {
      const result = appController.health();
      expect(result).toEqual({ status: 'UP' });
    });
  });

  describe('getLogs', () => {
    it('should return an array of logs', async () => {
      const result = await appController.getLogs();
      expect(result).toEqual([]);
    });
  });
});
