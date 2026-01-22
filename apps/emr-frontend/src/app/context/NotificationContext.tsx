import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Interfaz para los datos que llegan del backend
interface NotificationPayload {
  message: string;
  severity?: AlertColor;
  [key: string]: unknown;
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

const SOCKET_URL = 'http://localhost:3006';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [socket, setSocket] = useState<Socket | null>(null);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('🟢 [FRONTEND] Conectado a WebSocket de Notificaciones');
    });

    newSocket.on('notification', (data: NotificationPayload) => {
      // eslint-disable-next-line no-console
      console.log('🔔 Notificación recibida:', data);

      setMessage(data.message || 'Nueva notificación');
      setSeverity('info');
      setOpen(true);

      const audio = new Audio('/assets/notification.mp3');
      // 👇 ARREGLO DEL ERROR: Ponemos un comentario dentro de la función vacía
      audio.play().catch(() => {
        /* Ignorar error de autoplay */
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  const showNotification = (msg: string, type: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
