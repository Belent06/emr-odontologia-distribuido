import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';

describe('AppService', () => {
  let service: AppService;

  // 1. Mock del Repositorio de TypeORM (Base de Datos Falsa)
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // 2. Mock de RabbitMQ (Servicio de Mensajería Falso)
  const mockHistoryClient = {
    emit: jest.fn(),
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        // 👇 Inyectamos el Mock del Repositorio de Citas
        {
          provide: getRepositoryToken(Appointment),
          useValue: mockRepository,
        },
        // 👇 Inyectamos el Mock de RabbitMQ ('HISTORY_SERVICE')
        // El error decía explícitamente que faltaba este proveedor
        {
          provide: 'HISTORY_SERVICE',
          useValue: mockHistoryClient,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
