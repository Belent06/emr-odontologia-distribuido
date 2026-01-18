import { Inject, Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  // Asegúrate de que estos puertos sean los CORRECTOS de tus microservicios
  private readonly AUTH_URL = 'http://localhost:3000/api'; // svc-auth
  private readonly PATIENTS_URL = 'http://localhost:3333/api'; // svc-patients
  // 👇 1. NUEVA URL PARA AGENDA (Puerto 3001)
  private readonly APPOINTMENTS_URL = 'http://localhost:3001/api';

  constructor(
    private readonly httpService: HttpService,
    @Inject('HISTORY_SERVICE') private readonly clientHistory: ClientProxy,
  ) {}

  // --- AUTH ---
  async proxyAuthLogin(loginDto: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.AUTH_URL}/auth/login`, loginDto),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyAuthRegister(userDto: any, authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.AUTH_URL}/users`, userDto, {
          headers: { Authorization: authHeader },
        }),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- PACIENTES ---
  async proxyGetPatients(authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.PATIENTS_URL}/patients`, {
          headers: { Authorization: authHeader },
        }),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyCreatePatient(patientDto: any, authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.PATIENTS_URL}/patients`, patientDto, {
          headers: { Authorization: authHeader },
        }),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyUpdatePatient(id: string, updateDto: any, authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${this.PATIENTS_URL}/patients/${id}`,
          updateDto,
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyDeletePatient(id: string, authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(`${this.PATIENTS_URL}/patients/${id}`, {
          headers: { Authorization: authHeader },
        }),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- 📅 AGENDA / APPOINTMENTS (NUEVO BLOQUE) ---

  // Crear Cita
  async proxyCreateAppointment(appointmentDto: any, authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        // Enviamos al puerto 3001
        this.httpService.post(
          `${this.APPOINTMENTS_URL}/appointments`,
          appointmentDto,
          {
            headers: { Authorization: authHeader },
          },
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Ver Citas
  async proxyGetAppointments(authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        // Pedimos al puerto 3001
        this.httpService.get(`${this.APPOINTMENTS_URL}/appointments`, {
          headers: { Authorization: authHeader },
        }),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- HISTORIA (RABBITMQ) ---
  async proxyGetHistory() {
    try {
      return await firstValueFrom(
        this.clientHistory.send({ cmd: 'get_all_histories' }, {}),
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error en microservicio de historia',
        500,
      );
    }
  }

  getData() {
    return { message: 'Bienvenido al API Gateway de la Clínica Odontológica' };
  }

  // --- HELPER PARA MANEJAR ERRORES HTTP (DRY) ---
  private handleError(error: any) {
    const msg =
      error.response?.data || 'Error de comunicación con microservicio';
    const status = error.response?.status || 500;
    throw new HttpException(msg, status);
  }
}
