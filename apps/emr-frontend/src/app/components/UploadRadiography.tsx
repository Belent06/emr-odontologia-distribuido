import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FilesService } from '../../services/files.service';

interface Props {
  patientId: string;
  onUploadSuccess: () => void; // Para recargar la lista al terminar
}

export const UploadRadiography: React.FC<Props> = ({
  patientId,
  onUploadSuccess,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validación básica de tamaño (ej. max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es muy grande (Max 5MB)');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // 1. Pedir URL
      const presignedData = await FilesService.getPresignedUrl(
        file.name,
        file.type,
        patientId,
      );

      // 2. Subir a MinIO
      await FilesService.uploadToS3(presignedData.uploadUrl, file);

      // 3. Confirmar
      await FilesService.confirmUpload({
        key: presignedData.key,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        patientId: patientId,
      });

      onUploadSuccess(); // ¡Éxito!
    } catch (err) {
      console.error(err);
      setError('Error al subir la imagen. Intente nuevamente.');
    } finally {
      setUploading(false);
      event.target.value = ''; // Limpiar input
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, mb: 2, textAlign: 'center', bgcolor: '#f9f9f9' }}
    >
      <Typography variant="subtitle2" gutterBottom>
        Adjuntar Radiografía o Documento
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
          <input
            type="file"
            hidden
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
        </Button>
        {uploading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </Paper>
  );
};
