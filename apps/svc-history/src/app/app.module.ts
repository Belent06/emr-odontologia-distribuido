import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  PatientHistory,
  PatientHistorySchema,
} from './schemas/patient-history.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://admin:adminpassword@localhost:27017/history_db?authSource=admin',
    ),
    // 👇 REGISTRAMOS EL MODELO AQUÍ 👇
    MongooseModule.forFeature([
      { name: PatientHistory.name, schema: PatientHistorySchema },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
