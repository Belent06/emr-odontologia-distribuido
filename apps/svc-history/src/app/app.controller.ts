import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('patient_created')
  async handlePatientCreated(@Payload() data: any) {
    console.log('✅ [HISTORY-SVC] Evento de RabbitMQ recibido correctamente');
    console.log('📦 Datos completos del paciente:', data);
    await this.appService.createInitialHistory(data);
  }
}
