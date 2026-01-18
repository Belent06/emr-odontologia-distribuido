import axios from 'axios';

// Asegúrate que esta URL coincida con tu Gateway
const API_URL = 'http://localhost:3080/api/patients';

// Helper para obtener el token (usamos 'jwt' como acordamos)
const getAuthHeaders = () => {
  const token = localStorage.getItem('jwt');
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const PatientService = {
  // Obtener todos los pacientes (para luego buscar en memoria)
  getAll: async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  // Aquí podrías agregar create, update, delete en el futuro
};
