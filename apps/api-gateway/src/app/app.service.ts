import { Inject, Injectable, HttpException } from '@nestjs/common'; // 👈 Importante: HttpException
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  // Asegúrate de que estos puertos sean los CORRECTOS de tus microservicios
  private readonly AUTH_URL = 'http://localhost:3000/api'; // svc-auth
  private readonly PATIENTS_URL = 'http://localhost:3333/api'; // svc-patients

  constructor(
    private readonly httpService: HttpService,
    @Inject('HISTORY_SERVICE') private readonly clientHistory: ClientProxy,
  ) {}

  // 1. Proxy para Login
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

  // 2. Proxy para Registro
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

  // 3. Proxy para Obtener Pacientes
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

  // 4. Proxy para Crear Pacientes
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

  // 5. Proxy para Historia Clínica (RABBITMQ)
  async proxyGetHistory() {
    // RabbitMQ maneja los errores de forma diferente (Observable),
    // pero firstValueFrom lanzará error si falla.
    try {
      return await firstValueFrom(
        this.clientHistory.send({ cmd: 'get_all_histories' }, {}),
      );
    } catch (error) {
      // RabbitMQ suele devolver objetos de error, no response HTTP estándar
      // Devolvemos un 500 genérico o el mensaje si existe
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
    // Extraemos el mensaje y el status que nos devolvió el microservicio
    const msg =
      error.response?.data || 'Error de comunicación con microservicio';
    const status = error.response?.status || 500;

    // Lanzamos la excepción para que NestJS responda bonito al cliente
    throw new HttpException(msg, status);
  }
}
