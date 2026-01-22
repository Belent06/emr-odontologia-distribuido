import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios'; // Para llamar a n8n
import { NotificationsGateway } from './notifications.gateway';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  // URL de n8n (según tu docker-compose)
  private readonly N8N_WEBHOOK_URL =
    'http://localhost:5678/webhook/appointment-created';

  constructor(
    private readonly gateway: NotificationsGateway,
    private readonly httpService: HttpService,
  ) {}

  @EventPattern('appointment_created')
  async handleAppointmentCreated(@Payload() data: any) {
    this.logger.log(`⚡ Evento Recibido: appointment_created`, data);

    // 1. Notificación en Tiempo Real (Frontend)
    this.gateway.notifyUser(data.doctorId, 'Nueva Cita Agendada', data);

    // 2. Automatización (n8n) - Enviar WhatsApp/Email
    try {
      this.logger.log('🤖 Enviando datos a n8n...');
      // Solo enviamos si n8n está configurado, para no romper el flujo si falla
      await firstValueFrom(this.httpService.post(this.N8N_WEBHOOK_URL, data));
    } catch (error) {
      this.logger.warn(
        '⚠️ No se pudo conectar con n8n (¿Está el workflow activo?)',
      );
    }
  }
}
