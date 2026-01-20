import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. RECEPTOR DE EVENTOS (Pacientes) - Legacy pero útil
  @EventPattern('patient_created')
  async handlePatientCreated(@Payload() data: any) {
    console.log('✅ [HISTORY-SVC] Evento patient_created recibido');
    // En DynamoDB esto es opcional, pero lo dejamos para no romper el flujo
    await this.appService.createInitialHistory(data);
  }

  // 2. RECEPTOR DE EVENTOS: CITA COMPLETADA (RabbitMQ - Fire & Forget)
  @EventPattern('appointment_completed')
  async handleAppointmentCompleted(@Payload() data: any) {
    console.log(
      '✅ [HISTORY-SVC] Evento appointment_completed recibido:',
      data,
    );
    // Persiste en DynamoDB usando Single-Table Design
    await this.appService.addEntryFromAppointment(data);
  }

  // 3. RESPONDEDOR DE PETICIONES (Request-Response)
  // 👇 ESTE ES EL CAMBIO CLAVE QUE SOLUCIONA EL ERROR 500 👇
  @MessagePattern({ cmd: 'get_histories_by_patient' })
  async handleGetHistories(@Payload() patientId: string) {
    console.log(
      `🔍 [HISTORY-SVC] Buscando historial específico para: ${patientId}`,
    );
    // Llama al método optimizado de DynamoDB (Query por PK)
    return this.appService.findAllByPatient(patientId);
  }
}
