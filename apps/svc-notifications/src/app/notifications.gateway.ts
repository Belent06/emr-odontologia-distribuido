import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Permitir conexiones desde React (localhost:4200)
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('NotificationsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Método para enviar alertas al Frontend
  notifyUser(userId: string, message: string, payload: any) {
    // En un sistema real, filtraríamos por userId.
    // Por ahora, hacemos broadcast a todos los conectados (Doctores/Secretarias)
    this.server.emit('notification', {
      message,
      ...payload,
      timestamp: new Date(),
    });
  }
}
