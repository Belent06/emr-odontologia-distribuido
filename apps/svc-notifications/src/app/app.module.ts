import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [HttpModule], // 👈 Necesario para llamar a n8n
  controllers: [AppController],
  providers: [NotificationsGateway],
})
export class AppModule {}
