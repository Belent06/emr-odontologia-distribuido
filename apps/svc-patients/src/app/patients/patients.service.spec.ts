import { Test, TestingModule } from '@nestjs/testing';
import { PatientsService } from './patients.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('PatientsService', () => {
  let service: PatientsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        // 👇 1. Mock de Repo TypeORM
        {
          provide: getRepositoryToken(Patient),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        // 👇 2. Mock de History
        {
          provide: 'HISTORY_SERVICE',
          useValue: { emit: jest.fn() },
        },
        // 👇 3. Mock de Auditoría (El nuevo)
        {
          provide: 'AUDIT_SERVICE',
          useValue: { emit: jest.fn() },
        },
        // 👇 4. Mock de Cache Redis
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
