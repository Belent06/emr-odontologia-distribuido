import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

// 👇 MOCK DE DYNAMODB (IMPORTANTE)
const mockPut = jest.fn().mockReturnValue({ promise: jest.fn() });
const mockQuery = jest
  .fn()
  .mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [] }) });
const mockScan = jest
  .fn()
  .mockReturnValue({ promise: jest.fn().mockResolvedValue({ Items: [] }) });

jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        put: mockPut,
        query: mockQuery,
        scan: mockScan,
      })),
    },
  };
});

describe('AppService', () => {
  // ... resto del test igual ...
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
});
