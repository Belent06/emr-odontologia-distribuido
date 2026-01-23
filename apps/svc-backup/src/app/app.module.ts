import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule'; // 👈 Importante
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ScheduleModule.forRoot(), // 👈 Activa los Cron Jobs
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
