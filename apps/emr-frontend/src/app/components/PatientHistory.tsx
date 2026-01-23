import React, { useEffect, useState } from 'react';
import axios from 'axios';

// 👇 Interfaz que coincide EXACTAMENTE con tu DynamoDB (Mayúsculas importan)
interface HistoryEntry {
  PK: string;
  SK: string;
  Reason: string; // Motivo de la cita
  Details: string; // Notas de evolución
  DoctorId: string;
  CreatedAt: string; // Fecha ISO
}

interface Props {
  patientId: string;
  token: string; // Token JWT del usuario logueado
}

export const PatientHistory: React.FC<Props> = ({ patientId, token }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que cambia el paciente, recargamos su historial
  useEffect(() => {
    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // 👇 Apuntamos al Gateway (Puerto 3080)
      const response = await axios.get(
        `http://localhost:3080/api/history/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
      // Si es 404 puede ser que no tenga historial, no es necesariamente un error grave
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📄 Historial Clínico
        </h2>
        <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
          DynamoDB Storage
        </span>
      </div>

      {loading && (
        <div className="text-center py-4 text-gray-500 animate-pulse">
          Cargando datos distribuidos...
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed rounded-lg">
          <p>No hay registros históricos para este paciente.</p>
        </div>
      )}

      <div className="space-y-6">
        {history.map((entry) => (
          <div
            key={entry.SK}
            className="relative pl-8 border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg hover:shadow-sm transition-shadow"
          >
            {/* Punto de línea de tiempo */}
            <div className="absolute -left-2.5 top-4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>

            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-500 font-semibold">
                  {new Date(entry.CreatedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(entry.CreatedAt).toLocaleTimeString()}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">
                Dr. {entry.DoctorId}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {entry.Reason}
            </h3>

            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {entry.Details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
