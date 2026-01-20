// init-dynamo.js
const AWS = require('aws-sdk');

// Configuración para apuntar al Docker Local
const dynamo = new AWS.DynamoDB({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: { accessKeyId: 'fake', secretAccessKey: 'fake' },
});

const params = {
  TableName: 'emr-history-table', // ⚠️ IMPORTANTE: Debe coincidir con el service
  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' }, // Partition Key
    { AttributeName: 'SK', KeyType: 'RANGE' }, // Sort Key
  ],
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' }, // String
    { AttributeName: 'SK', AttributeType: 'S' }, // String
  ],
  ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
};

console.log('⏳ Intentando crear tabla en DynamoDB Local...');

dynamo.createTable(params, (err, data) => {
  if (err) {
    if (err.code === 'ResourceInUseException') {
      console.log('✅ La tabla ya existe. Puedes continuar.');
    } else {
      console.error('❌ Error creando tabla:', err);
    }
  } else {
    console.log(
      '🚀 Tabla creada exitosamente:',
      data.TableDescription.TableName,
    );
  }
});
