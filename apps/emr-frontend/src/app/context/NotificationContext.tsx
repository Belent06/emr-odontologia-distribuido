import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Definimos la forma de nuestro contexto (por si queremos usarlo manualmente después)
interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
}

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

// URL de tu microservicio de Notificaciones
const SOCKET_URL = 'http://localhost:3006';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  // Estado para el Snackbar (La ventanita visual)
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info'); // 'success' | 'info' | 'warning' | 'error'

  // 1. Conexión al WebSocket al cargar la App
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Escuchar evento 'connect' para confirmar conexión
    newSocket.on('connect', () => {
      console.log('🟢 [FRONTEND] Conectado a WebSocket de Notificaciones');
    });

    // 👇 AQUÍ LA MAGIA: Escuchamos el evento que envía el Backend
    newSocket.on('notification', (data: any) => {
      console.log('🔔 Notificación recibida:', data);

      // Mostramos el Toast visual
      setMessage(data.message || 'Nueva notificación');
      setSeverity('info'); // Podrías mandar el tipo desde el backend también
      setOpen(true);

      // Reproducir un sonido sutil (Opcional)
      const audio = new Audio('/assets/notification.mp3'); // Asegúrate de tener un audio o borra esta línea
      audio.play().catch(() => {}); // Ignorar error si no hay interacción usuario
    });

    // Limpieza al cerrar
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Función para cerrar el Snackbar
  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  // Función manual por si queremos invocar alertas desde código
  const showNotification = (msg: string, type: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* COMPONENTE VISUAL FLOTANTE */}
      <Snackbar
        open={open}
        autoHideDuration={6000} // Se va solo a los 6 segundos
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Esquina inferior derecha
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
