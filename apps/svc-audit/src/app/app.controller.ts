import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getLogs() {
    return this.appService.getLogs();
  }

  @Get('health')
  health() {
    return this.appService.getHealth();
  }

  // 👇 CORRECCIÓN DE LÓGICA:
  // Este handler recibe CUALQUIER evento 'audit_event'.
  // No debemos hardcodear 'USER_REGISTERED' aquí, porque puede ser un LOGIN, un UPDATE, etc.
  @EventPattern('audit_event')
  async handleAuditEvent(@Payload() data: any) {
    console.log('📨 [RabbitMQ] Evento recibido:', data);

    // Pasamos la data tal cual viene, porque svc-auth ya la estructuró bien
    // (trae action, actor, resourceId, etc.)
    await this.appService.createAuditLog(data);
  }

  // Este lo dejamos por si acaso el backup sigue usando el canal viejo,
  // pero idealmente deberías migrar backup a 'audit_event' también en el futuro.
  @EventPattern('backup_completed')
  async handleBackup(@Payload() data: any) {
    await this.appService.createAuditLog({
      action: 'BACKUP_FINISHED',
      source: 'svc-backup',
      details: data,
    });
  }
}
