import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

// 👇 1. MOCK DE UUID (Esto arregla el error "Unexpected token 'export'")
// Al hacer esto, Jest usa esta función falsa en lugar de intentar leer la librería real.
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

// 👇 2. MOCK DE AWS DYNAMODB (Para evitar conexión real)
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({ TableNames: ['AuditLogs'] }),
  })),
  ListTablesCommand: jest.fn(),
  CreateTableCommand: jest.fn(),
}));

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({}),
    }),
  },
  PutCommand: jest.fn(),
  ScanCommand: jest.fn(),
}));

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

  // Test corregido para usar getHealth en lugar de getData
  describe('getHealth', () => {
    it('should return status UP', () => {
      const result = service.getHealth();
      expect(result).toEqual({
        status: 'UP',
        service: 'svc-audit',
        db: 'DynamoDB',
      });
    });
  });
});
