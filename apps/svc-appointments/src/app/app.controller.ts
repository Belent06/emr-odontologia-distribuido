import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common'; // 👈 Agregamos Patch y Param
import { AppService } from './app.service';

@Controller('appointments')
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

  // 👇 NUEVO: Endpoint para cambiar estatus (PATCH /api/appointments/:id/status)
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string, // Leemos el ID de la URL
    @Body('status') status: string, // Leemos el nuevo estatus del Body
  ) {
    return this.appService.updateStatus(id, status);
  }
}
