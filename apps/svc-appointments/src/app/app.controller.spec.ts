import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  // 👇 1. Mock corregido con nombres de métodos de Microservicio (no del Gateway)
  const mockAppService = {
    create: jest.fn(), // Antes era proxyCreateAppointment
    findAll: jest.fn(), // Antes era proxyGetAppointments
    updateStatus: jest.fn(), // Antes era proxyUpdateAppointmentStatus
    cancel: jest.fn(),
    getData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
