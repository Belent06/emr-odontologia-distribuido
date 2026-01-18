import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        // 👇 NECESITAMOS LOS MISMOS MOCKS AQUÍ PORQUE EL SERVICIO LOS PIDE
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of({ data: [] })),
            post: jest.fn(() => of({ data: {} })),
          },
        },
        {
          provide: 'HISTORY_SERVICE',
          useValue: {
            send: jest.fn(() => of([])),
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
