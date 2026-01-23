import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientHistory } from '../app/components/PatientHistory';
import { UploadRadiography } from '../app/components/UploadRadiography';
import { FileGallery } from '../app/components/FileGallery';

// Importamos el Grid estándar (que en tu versión ya es el Grid v2)
import Grid from '@mui/material/Grid';
import { Paper, Divider } from '@mui/material';

export const HistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estado para refrescar la galería
  const [refreshGalleryToken, setRefreshGalleryToken] = useState(0);

  const token = localStorage.getItem('jwt') || '';

  if (!id) return <div>Error: No se especificó paciente.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Botón Volver */}
      <button
        onClick={() => navigate('/patients')}
        className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
      >
        ⬅ Volver a Pacientes
      </button>

      {/* Título */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Expediente Médico</h1>
        <p className="text-gray-500">
          Visualización centralizada de eventos distribuidos (DynamoDB + S3)
        </p>
      </div>

      {/* LAYOUT PRINCIPAL */}
      {/* ⚠️ CORRECCIÓN: Grid v2 usa 'container' pero NO usa 'item' en los hijos */}
      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: HISTORIAL */}
        {/* Usamos 'size' en lugar de 'item xs={12}' */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 2, minHeight: '500px' }}>
            <PatientHistory patientId={id} token={token} />
          </Paper>
        </Grid>

        {/* COLUMNA DERECHA: ARCHIVOS */}
        <Grid size={{ xs: 12, md: 4 }}>
          <div className="flex flex-col gap-4">
            <UploadRadiography
              patientId={id}
              onUploadSuccess={() => {
                setRefreshGalleryToken((prev) => prev + 1);
              }}
            />

            <Divider />

            <FileGallery patientId={id} refreshTrigger={refreshGalleryToken} />
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
