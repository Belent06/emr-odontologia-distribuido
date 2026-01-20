import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PatientHistory } from '../app/components/PatientHistory';

export const HistoryPage: React.FC = () => {
  // 1. Capturamos el ID de la URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 2. Recuperamos el token (idealmente de un Context, aquí del storage por rapidez)
  const token = localStorage.getItem('access_token') || '';

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

      {/* Título de la Página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Expediente Médico</h1>
        <p className="text-gray-500">
          Visualización centralizada de eventos distribuidos
        </p>
      </div>

      {/* Renderizamos el componente con la lógica de DynamoDB */}
      <PatientHistory patientId={id} token={token} />
    </div>
  );
};
