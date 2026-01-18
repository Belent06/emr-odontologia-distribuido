import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. RECEPTOR DE EVENTOS (Pacientes)
  @EventPattern('patient_created')
  async handlePatientCreated(@Payload() data: any) {
    console.log('✅ [HISTORY-SVC] Evento patient_created recibido');
    await this.appService.createInitialHistory(data);
  }

  // 👇 2. NUEVO RECEPTOR: CITA COMPLETADA
  @EventPattern('appointment_completed')
  async handleAppointmentCompleted(@Payload() data: any) {
    console.log(
      '✅ [HISTORY-SVC] Evento appointment_completed recibido:',
      data,
    );
    // Aquí el servicio creará la entrada médica
    await this.appService.addEntryFromAppointment(data);
  }

  // 3. RESPONDEDOR DE PETICIONES
  @MessagePattern({ cmd: 'get_all_histories' })
  async handleGetAllHistories() {
    console.log('🔍 [HISTORY-SVC] Petición de lista de historias recibida');
    return this.appService.findAll();
  }
}
