import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // <--- Importante
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from './entities/patient.entity'; // <--- Importante

@Module({
  imports: [
    // ESTA ES LA LÍNEA QUE TE FALTA O ESTÁ FALLANDO:
    TypeOrmModule.forFeature([Patient]),
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  // Exportamos el servicio por si otros módulos lo necesitan en el futuro
  exports: [PatientsService],
})
export class PatientsModule {}
