import { Inject, Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  // Asegúrate de que estos puertos sean los CORRECTOS de tus microservicios
  private readonly AUTH_URL = 'http://localhost:3000/api'; // svc-auth
  private readonly PATIENTS_URL = 'http://localhost:3333/api'; // svc-patients
  private readonly APPOINTMENTS_URL = 'http://localhost:3001/api'; // svc-appointments

  // 👇 NUEVO: URL del Microservicio de Archivos
  private readonly FILES_URL = 'http://localhost:3005/api'; // svc-files

  constructor(
    private readonly httpService: HttpService,
    // 👇 Inyectamos el cliente de historia configurado en el AppModule
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

  // --- 📅 AGENDA / APPOINTMENTS ---

  async proxyCreateAppointment(appointmentDto: any, authHeader: string) {
    try {
      const { data } = await firstValueFrom(
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

  async proxyGetAppointments(authHeader: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(`${this.APPOINTMENTS_URL}/appointments`, {
          headers: { Authorization: authHeader },
        }),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyUpdateAppointmentStatus(
    id: string,
    status: string,
    authHeader: string,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${this.APPOINTMENTS_URL}/appointments/${id}/status`,
          { status },
          { headers: { Authorization: authHeader } },
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- 📂 ARCHIVOS / FILES (NUEVO) ---

  async proxyGeneratePresignedUrl(data: any, authHeader: string) {
    try {
      // POST http://localhost:3004/presigned-url
      const { data: response } = await firstValueFrom(
        this.httpService.post(`${this.FILES_URL}/presigned-url`, data),
      );
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyConfirmUpload(data: any, authHeader: string) {
    try {
      // POST http://localhost:3004/confirm
      const { data: response } = await firstValueFrom(
        this.httpService.post(`${this.FILES_URL}/confirm`, data),
      );
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async proxyGetPatientFiles(patientId: string, authHeader: string) {
    try {
      // GET http://localhost:3004/patient/:id
      const { data: response } = await firstValueFrom(
        this.httpService.get(`${this.FILES_URL}/patient/${patientId}`),
      );
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  // --- 🏥 HISTORIA (RABBITMQ) ---

  // 👇 EDITADO: Ahora acepta authHeader para que coincida con el controlador
  async proxyGetHistory(patientId: string, authHeader: string) {
    try {
      console.log(
        `🛰️ Gateway: Pidiendo historial específico para paciente: ${patientId}`,
      );

      return await firstValueFrom(
        this.clientHistory.send(
          { cmd: 'get_histories_by_patient' }, // 👈 1. Usamos el comando de búsqueda por ID
          patientId, // 👈 2. Payload: Enviamos el ID (string) directamente
        ),
      );
    } catch (error) {
      console.error('❌ Error en Gateway-History:', error);
      throw new HttpException(
        error.message || 'Error comunicando con microservicio de historia',
        500,
      );
    }
  }

  getData() {
    return { message: 'Bienvenido al API Gateway de la Clínica Odontológica' };
  }

  private handleError(error: any) {
    const msg =
      error.response?.data || 'Error de comunicación con microservicio';
    const status = error.response?.status || 500;
    throw new HttpException(msg, status);
  }
}
