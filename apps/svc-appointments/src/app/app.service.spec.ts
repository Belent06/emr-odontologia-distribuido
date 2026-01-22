import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';

describe('AppService', () => {
  let service: AppService;

  // 1. Mock del Repositorio TypeORM
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    })),
  };

  // 2. Mock del Cliente RabbitMQ (Sirve para ambos servicios)
  const mockClientProxy = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        // Mock de la Base de Datos
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
        },
        // Mock del servicio de Historial
        {
          provide: 'HISTORY_SERVICE',
          useValue: mockClientProxy,
        },
        // 👇 AQUÍ ESTABA EL ERROR: Faltaba inyectar este mock
        {
          provide: 'NOTIFICATIONS_SERVICE',
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
