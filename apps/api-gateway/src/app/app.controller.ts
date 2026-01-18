import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  Patch, // 👈 Necesario para editar
  Delete, // 👈 Necesario para borrar
  Param, // 👈 Necesario para leer el :id de la URL
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // --- RUTAS PÚBLICAS ---

  @Post('auth/login')
  async login(@Body() loginDto: any) {
    return this.appService.proxyAuthLogin(loginDto);
  }

  // --- RUTAS PROTEGIDAS POR ROL ---

  @Post('auth/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async register(
    @Body() userDto: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyAuthRegister(userDto, authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor', 'receptionist')
  @Get('patients')
  async getPatients(@Headers('authorization') authHeader: string) {
    return this.appService.proxyGetPatients(authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor')
  @Post('patients')
  async createPatient(
    @Body() patientDto: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyCreatePatient(patientDto, authHeader);
  }

  // 👇 NUEVO: Editar Paciente (PATCH /patients/:id)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor') // Doctores y Admin pueden corregir datos
  @Patch('patients/:id')
  async updatePatient(
    @Param('id') id: string, // Leemos el ID de la URL
    @Body() updateDto: any, // Leemos los datos a cambiar
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyUpdatePatient(id, updateDto, authHeader);
  }

  // 👇 NUEVO: Borrar Paciente (DELETE /patients/:id)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin') // ⚠️ Solo el ADMIN puede borrar (seguridad extra)
  @Delete('patients/:id')
  async deletePatient(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyDeletePatient(id, authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor')
  @Get('history')
  async getHistory() {
    return this.appService.proxyGetHistory();
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
