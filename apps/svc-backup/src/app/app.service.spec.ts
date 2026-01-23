import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

// 👇 Mocks globales para que no intente conectarse a AWS ni Postgres en los tests
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
  HeadBucketCommand: jest.fn(),
  CreateBucketCommand: jest.fn(),
}));

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 👇 Test actualizado: Probamos getHealth en lugar de getData
  describe('getHealth', () => {
    it('should return status UP', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('status', 'UP');
      expect(result).toHaveProperty('service', 'svc-backup');
    });
  });
});
