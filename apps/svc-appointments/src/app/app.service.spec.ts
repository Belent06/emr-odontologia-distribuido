import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';

describe('AppService', () => {
  let service: AppService;

  // Creamos un "doble" del repositorio con funciones vacías
  const mockAppointmentRepository = {
    find: jest.fn(() => []),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          // Cuando el servicio pida el Repositorio de Appointment...
          provide: getRepositoryToken(Appointment),
          // ...le damos este objeto falso.
          useValue: mockAppointmentRepository,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
