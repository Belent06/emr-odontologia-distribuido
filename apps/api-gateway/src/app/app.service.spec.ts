import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        // 👇 1. MOCK DE HTTP SERVICE (Simulamos Axios)
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(() => of({ data: [] })), // Simula respuesta vacía
            post: jest.fn(() => of({ data: {} })), // Simula respuesta vacía
          },
        },
        // 👇 2. MOCK DE HISTORY SERVICE (Simulamos RabbitMQ)
        {
          provide: 'HISTORY_SERVICE',
          useValue: {
            send: jest.fn(() => of([])), // Simula respuesta de RabbitMQ
            emit: jest.fn(),
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
