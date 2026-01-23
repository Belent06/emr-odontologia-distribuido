import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          // Mockeamos el servicio para que el test no intente conectarse a AWS/DB real
          useValue: {
            getHealth: jest.fn().mockReturnValue({ status: 'UP' }),
          },
        },
      ],
    }).compile();
  });

  describe('getHealth', () => {
    it('should return "UP"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getHealth()).toEqual({ status: 'UP' });
    });
  });
});
