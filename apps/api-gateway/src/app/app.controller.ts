import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller() // 👈 Agregamos el prefijo 'api' para que tus rutas sean /api/auth, /api/patients, etc.
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

  // --- PACIENTES ---

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor')
  @Patch('patients/:id')
  async updatePatient(
    @Param('id') id: string,
    @Body() updateDto: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyUpdatePatient(id, updateDto, authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete('patients/:id')
  async deletePatient(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyDeletePatient(id, authHeader);
  }

  // --- RUTAS DE AGENDA / APPOINTMENTS ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor', 'receptionist')
  @Post('appointments')
  async createAppointment(
    @Body() appointmentDto: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyCreateAppointment(appointmentDto, authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor', 'receptionist')
  @Get('appointments')
  async getAppointments(@Headers('authorization') authHeader: string) {
    return this.appService.proxyGetAppointments(authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor', 'receptionist')
  @Patch('appointments/:id/status')
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Headers('authorization') authHeader: string,
  ) {
    return this.appService.proxyUpdateAppointmentStatus(id, status, authHeader);
  }

  // --- HISTORIAL CLÍNICO ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor')
  @Get('history') // 👈 Endpoint: GET /api/history
  async getHistory(@Headers('authorization') authHeader: string) {
    // Pasamos el authHeader por si acaso necesitas validar algo en el microservicio
    return this.appService.proxyGetHistory(authHeader);
  }
}
