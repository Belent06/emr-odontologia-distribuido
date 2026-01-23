import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

// Mockeamos la librería aws-sdk para que no pida credenciales reales
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: jest.fn().mockReturnThis(),
        query: jest.fn().mockReturnThis(),
        scan: jest.fn().mockReturnThis(),
        promise: jest.fn().mockResolvedValue({ Items: [] }),
      })),
    },
  };
});

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        // 👇 SOLUCIÓN: Simulamos el cliente de auditoría
        {
          provide: 'AUDIT_SERVICE',
          useValue: {
            emit: jest.fn(), // Simulamos la función emit
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
