import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'; // 👈 Añadimos MessagePattern
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 1. RECEPTOR DE EVENTOS (Ya lo tenías - One way)
  @EventPattern('patient_created')
  async handlePatientCreated(@Payload() data: any) {
    console.log('✅ [HISTORY-SVC] Evento de RabbitMQ recibido correctamente');
    await this.appService.createInitialHistory(data);
  }

  // 2. RESPONDEDOR DE PETICIONES (Nuevo - Request-Response) 🚀
  @MessagePattern({ cmd: 'get_all_histories' }) // 👈 Debe coincidir con el Gateway
  async handleGetAllHistories() {
    console.log('🔍 [HISTORY-SVC] Petición de lista de historias recibida');
    // Aquí llamas a un método en tu servicio que busque en la DB (Mongo o Postgres)
    return this.appService.findAll();
  }
}
