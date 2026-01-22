import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { NotificationsGateway } from './notifications.gateway';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs'; // 👈 Necesario para simular la respuesta de Axios

describe('AppController', () => {
  let appController: AppController;

  // 1. Mock del Gateway (WebSockets)
  const mockGateway = {
    notifyUser: jest.fn(),
  };

  // 2. Mock de HttpService (Para n8n)
  const mockHttpService = {
    post: jest.fn().mockReturnValue(of({ data: { success: true } })), // Simulamos respuesta exitosa
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: NotificationsGateway,
          useValue: mockGateway,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    // Opcional: Testear que el método llama al gateway
    it('should call notifyUser on appointment_created', async () => {
      const payload = { doctorId: '1', patientId: '2' };
      await appController.handleAppointmentCreated(payload);
      expect(mockGateway.notifyUser).toHaveBeenCalledWith(
        '1',
        'Nueva Cita Agendada',
        payload,
      );
    });
  });
});
