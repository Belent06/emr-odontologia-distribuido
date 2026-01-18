import React, { useEffect, useState } from 'react';
import { AppointmentService } from '../services/appointments.service';
import { PatientService } from '../services/patients.service';

interface Appointment {
  id: string;
  date: string;
  status: string;
  reason: string;
  doctorId: string;
  patientId: string;
}

// 👇 CORRECCIÓN 1: Definimos 'id' correctamente según tu consola
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  cedula: string;
}

const getPayloadFromToken = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchCedula, setSearchCedula] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    doctorId: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
    autoFillDoctor();
  }, []);

  const loadData = async () => {
    try {
      const apptData = await AppointmentService.getAll();
      setAppointments(apptData);

      const patientsData = await PatientService.getAll();
      setPatients(patientsData);
    } catch (err) {
      console.error(err);
      setError('Error cargando datos.');
    }
  };

  const autoFillDoctor = () => {
    const token = localStorage.getItem('jwt');
    if (token) {
      const payload = getPayloadFromToken(token);
      if (payload && payload.sub) {
        setFormData((prev) => ({ ...prev, doctorId: payload.sub }));
      }
    }
  };

  const handleSearchPatient = () => {
    if (!searchCedula) return;
    const found = patients.find((p) => p.cedula === searchCedula);

    if (found) {
      setSelectedPatient(found);
      setError('');
    } else {
      setSelectedPatient(null);
      alert('❌ Paciente no encontrado con esa cédula.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedPatient) {
      setError('⚠️ Por favor busca y selecciona un paciente.');
      setLoading(false);
      return;
    }

    try {
      // 👇 CORRECCIÓN 2: Aseguramos que la fecha se envíe correctamente (sin Z)
      const isoDate = new Date(
        `${formData.date}T${formData.time}`,
      ).toISOString();

      // 👇 CORRECCIÓN 3: Usamos selectedPatient.id (sin guion bajo)
      console.log('Enviando paciente con ID:', selectedPatient.id);

      await AppointmentService.create({
        date: isoDate,
        doctorId: formData.doctorId,
        patientId: selectedPatient.id, // ¡Aquí estaba el problema!
        reason: formData.reason,
      });

      alert('¡Cita agendada con éxito!');
      loadData();

      setFormData((prev) => ({ ...prev, date: '', time: '', reason: '' }));
      setSelectedPatient(null);
      setSearchCedula('');
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 409) {
        setError(
          '❌ ERROR: Conflicto de horario (Doctor o Paciente ocupados).',
        );
      } else if (
        err.response &&
        err.response.data &&
        err.response.data.message
      ) {
        setError(`❌ Error: ${err.response.data.message}`);
      } else {
        setError('❌ Error al crear la cita.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta cita?')) return;
    try {
      await AppointmentService.cancel(id);
      loadData();
    } catch (err) {
      alert('Error al cancelar');
    }
  };

  // 👇 CORRECCIÓN 4: Buscamos por .id para mostrar el nombre en la tabla
  const getPatientName = (patientId: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    return p ? `${p.firstName} ${p.lastName}` : 'Desconocido';
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>📅 Gestión de Citas</h1>

      <div
        style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          maxWidth: '500px',
        }}
      >
        <h3>Nueva Cita</h3>
        {error && (
          <div
            style={{
              background: '#dc3545',
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          {/* Doctor Auto-detect */}
          <div>
            <label
              style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}
            >
              Doctor ID:
            </label>
            <input
              readOnly
              style={{
                width: '100%',
                background: '#e9ecef',
                border: '1px solid #ced4da',
                padding: '8px',
                color: '#495057',
              }}
              value={formData.doctorId}
            />
          </div>

          {/* Buscador Paciente */}
          <div
            style={{
              background: '#e7f1ff',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #b6d4fe',
            }}
          >
            <label
              style={{
                fontWeight: 'bold',
                color: '#0d6efd',
                display: 'block',
                marginBottom: '5px',
              }}
            >
              Buscar Paciente:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                placeholder="Ingrese Cédula"
                value={searchCedula}
                onChange={(e) => setSearchCedula(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              />
              <button
                type="button"
                onClick={handleSearchPatient}
                style={{
                  background: '#0d6efd',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0 15px',
                  cursor: 'pointer',
                }}
              >
                🔍
              </button>
            </div>

            {selectedPatient && (
              <div
                style={{ marginTop: '8px', color: 'green', fontWeight: 'bold' }}
              >
                ✅ {selectedPatient.firstName} {selectedPatient.lastName}
              </div>
            )}
          </div>

          {/* Fecha y Hora */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="date"
              required
              style={{ flex: 1, padding: '8px' }}
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <input
              type="time"
              required
              style={{ flex: 1, padding: '8px' }}
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
            />
          </div>

          <input
            placeholder="Motivo de consulta"
            required
            style={{ padding: '8px' }}
            value={formData.reason}
            onChange={(e) =>
              setFormData({ ...formData, reason: e.target.value })
            }
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#198754',
              color: 'white',
              padding: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Agendando...' : '📅 Agendar Cita'}
          </button>
        </form>
      </div>

      {/* Tabla */}
      <h3>Agenda Actual</h3>
      <table
        border={1}
        cellPadding={10}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderColor: '#ddd',
        }}
      >
        <thead style={{ background: '#343a40', color: 'white' }}>
          <tr>
            <th>Fecha/Hora</th>
            <th>Paciente</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
              <td>{new Date(appt.date).toLocaleString()}</td>
              <td>
                <strong>{getPatientName(appt.patientId)}</strong>
              </td>
              <td>
                <span
                  style={{
                    color: appt.status === 'CANCELLED' ? 'red' : 'green',
                    fontWeight: 'bold',
                  }}
                >
                  {appt.status}
                </span>
              </td>
              <td>
                {appt.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    style={{
                      cursor: 'pointer',
                      color: 'red',
                      border: '1px solid red',
                      background: 'white',
                      padding: '5px',
                      borderRadius: '4px',
                    }}
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
