import axios from 'axios';

// URL del Gateway
const API_URL = 'http://localhost:3080/api/appointments';

// Helper para sacar el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const AppointmentService = {
  // 1. Obtener lista
  getAll: async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  // 2. Crear Cita
  create: async (data: {
    date: string;
    doctorId: string;
    patientId: string;
    reason: string;
  }) => {
    // Axios lanza error si el status no es 2xx, así atraparemos el 409
    const response = await axios.post(API_URL, data, getAuthHeaders());
    return response.data;
  },

  // 3. Cancelar Cita
  cancel: async (id: string) => {
    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { status: 'CANCELLED' },
      getAuthHeaders(),
    );
    return response.data;
  },
};
