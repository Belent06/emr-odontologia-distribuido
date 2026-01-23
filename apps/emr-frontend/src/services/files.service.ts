import axios from 'axios';

// Ajusta esto si tu variable de entorno es diferente
const API_URL = 'http://localhost:3080/api';

export const FilesService = {
  /**
   * 1. Pedir permiso para subir (Obtener URL firmada)
   */
  getPresignedUrl: async (
    fileName: string,
    fileType: string,
    patientId: string,
  ) => {
    const token = localStorage.getItem('jwt'); // O de donde saques tu token
    const response = await axios.post(
      `${API_URL}/files/presigned-url`,
      { fileName, fileType, patientId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data; // Retorna { uploadUrl, key, ... }
  },

  /**
   * 2. Subir el archivo REAL a MinIO/S3 (Directo a la nube ☁️)
   * NOTA: Aquí NO enviamos token de Auth del backend, la seguridad está en la URL.
   */
  uploadToS3: async (uploadUrl: string, file: File) => {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type, // Debe coincidir con el paso 1
      },
    });
  },

  /**
   * 3. Confirmar al Backend que terminamos
   */
  confirmUpload: async (data: {
    key: string;
    fileName: string;
    mimeType: string;
    size: number;
    patientId: string;
  }) => {
    const token = localStorage.getItem('jwt');
    const response = await axios.post(`${API_URL}/files/confirm`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  /**
   * Obtener lista de archivos
   */
  getPatientFiles: async (patientId: string) => {
    const token = localStorage.getItem('jwt');
    const response = await axios.get(`${API_URL}/files/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};
