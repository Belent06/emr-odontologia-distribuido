import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('PatientsService', () => {
  let service: PatientsService;

  // 1. Mock del Repositorio de TypeORM
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // 2. Mock del Cliente RabbitMQ ('HISTORY_SERVICE')
  const mockHistoryClient = {
    emit: jest.fn(), // Para eventos (EventPattern)
    send: jest.fn(), // Para mensajes (MessagePattern)
  };

  // 3. Mock del Cache Manager (Redis)
  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        // 👇 Inyectamos el Mock del Repositorio
        {
          provide: getRepositoryToken(Patient),
          useValue: mockRepository,
        },
        // 👇 Inyectamos el Mock de RabbitMQ (¡ESTO FALTABA!)
        {
          provide: 'HISTORY_SERVICE',
          useValue: mockHistoryClient,
        },
        // 👇 Inyectamos el Mock de Cache
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
