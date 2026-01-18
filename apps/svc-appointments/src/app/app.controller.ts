import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('appointments') // 👈 Ruta base: /api/appointments
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.findAll();
  }

  @Post()
  create(@Body() body: any) {
    return this.appService.create(body);
  }
}
