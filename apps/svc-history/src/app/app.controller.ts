import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  @EventPattern('patient_created')
  handlePatientCreated(@Payload() data: any) {
    console.log('✅ [HISTORY-SVC] Evento recibido!');
    console.log('📦 Datos completos del paciente:', data);
  }
}
