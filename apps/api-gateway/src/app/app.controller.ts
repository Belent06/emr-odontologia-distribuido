// 👇 1. IMPORTANTE: Agregamos 'Headers' a los imports
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
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
    // Login es público, no necesita headers ni token previo
    return this.appService.proxyAuthLogin(loginDto);
  }

  // --- RUTAS PROTEGIDAS POR ROL ---

  @Post('auth/register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async register(
    @Body() userDto: any,
    @Headers('authorization') authHeader: string, // 👈 2. Capturamos el token del Admin
  ) {
    // Se lo pasamos al servicio para que svc-auth sepa que quien lo pide es un Admin
    return this.appService.proxyAuthRegister(userDto, authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor', 'receptionist')
  @Get('patients')
  async getPatients(
    @Headers('authorization') authHeader: string, // 👈 3. Capturamos el token
  ) {
    return this.appService.proxyGetPatients(authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor')
  @Post('patients')
  async createPatient(
    @Body() patientDto: any,
    @Headers('authorization') authHeader: string, // 👈 4. Capturamos el token
  ) {
    return this.appService.proxyCreatePatient(patientDto, authHeader);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'doctor')
  @Get('history')
  async getHistory() {
    // RabbitMQ NO usa headers HTTP, así que este se queda igual.
    // El Gateway ya validó la seguridad aquí.
    return this.appService.proxyGetHistory();
  }

  @Get()
  getData() {
    return this.appService.getData();
  }
}
