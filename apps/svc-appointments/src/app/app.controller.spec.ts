import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  // Creamos un "doble" del servicio
  const mockAppService = {
    proxyCreateAppointment: jest.fn(),
    proxyGetAppointments: jest.fn(),
    proxyUpdateAppointmentStatus: jest.fn(),
    // Agrega aquí otros métodos si los necesitas, pero con esto basta para que compile
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
