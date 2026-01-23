import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_GATEWAY_URL;

export const historyService = {
  // R-09: Persistencia Políglota (Consulta a DynamoDB vía Gateway)
  getPatientHistory: async (patientId: string) => {
    const response = await axios.get(`${API_URL}/history/${patientId}`);
    return response.data;
  },

  // Acción para completar cita y generar nota de evolución
  completeAppointment: async (appointmentId: string, medicalNote: any) => {
    const response = await axios.post(`${API_URL}/history/complete`, {
      appointmentId,
      ...medicalNote,
    });
    return response.data;
  },
};
