import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  cedula: string;
  email: string;
  birthDate: string;
}

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Eliminamos el estado 'error' que no usábamos mucho para simplificar
  const [showForm, setShowForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    cedula: '',
    phone: '',
    email: '',
    birthDate: '',
  });

  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchPatients();
  }, [token, navigate]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        'http://localhost:3333/api/patients',
        authConfig,
      );
      setPatients(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (newPatient.cedula.length !== 10) {
        alert('⚠️ La cédula debe tener exactamente 10 dígitos.');
        return;
      }
      await axios.post(
        'http://localhost:3333/api/patients',
        newPatient,
        authConfig,
      );
      setShowForm(false);
      setNewPatient({
        firstName: '',
        lastName: '',
        cedula: '',
        phone: '',
        email: '',
        birthDate: '',
      });
      fetchPatients();
      alert('Paciente creado ✅');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear';
      alert(`❌ Error: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    }
  };

  // --- FUNCIÓN NUEVA: BORRAR ---
  const handleDelete = async (id: string) => {
    // 1. Preguntar confirmación (Importante para no borrar por error)
    if (
      !window.confirm(
        '¿Estás seguro de eliminar a este paciente? Esta acción no se puede deshacer.',
      )
    ) {
      return;
    }

    try {
      // 2. Llamar al backend
      await axios.delete(
        `http://localhost:3333/api/patients/${id}`,
        authConfig,
      );

      // 3. Recargar la lista
      alert('Paciente eliminado 🗑️');
      fetchPatients();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar paciente');
    }
  };
  // -----------------------------

  if (loading) return <p>Cargando...</p>;

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '1000px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1>Panel de Pacientes 🦷</h1>
        <button
          onClick={() => {
            localStorage.removeItem('jwt');
            navigate('/');
          }}
          style={{
            padding: '8px 15px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Cerrar Sesión
        </button>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          background: showForm ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {showForm ? 'Cancelar' : '+ Nuevo Paciente'}
      </button>

      {showForm && (
        <div
          style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '1px solid #ddd',
          }}
        >
          <h3>Registrar Nuevo Paciente</h3>
          <form
            onSubmit={handleCreate}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
            }}
          >
            <input
              placeholder="Nombre"
              required
              value={newPatient.firstName}
              onChange={(e) =>
                setNewPatient({ ...newPatient, firstName: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Apellido"
              required
              value={newPatient.lastName}
              onChange={(e) =>
                setNewPatient({ ...newPatient, lastName: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Cédula (10 dígitos)"
              required
              maxLength={10}
              value={newPatient.cedula}
              onChange={(e) =>
                setNewPatient({ ...newPatient, cedula: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Teléfono"
              required
              value={newPatient.phone}
              onChange={(e) =>
                setNewPatient({ ...newPatient, phone: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={newPatient.email}
              onChange={(e) =>
                setNewPatient({ ...newPatient, email: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              type="date"
              required
              value={newPatient.birthDate}
              onChange={(e) =>
                setNewPatient({ ...newPatient, birthDate: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <button
              type="submit"
              style={{
                gridColumn: 'span 2',
                padding: '10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Guardar Paciente
            </button>
          </form>
        </div>
      )}

      <table
        style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}
      >
        <thead>
          <tr style={{ background: '#007bff', color: 'white' }}>
            <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Apellido</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Cédula</th>
            <th style={{ padding: '10px', textAlign: 'left' }}>Teléfono</th>
            <th style={{ padding: '10px', textAlign: 'center' }}>
              Acciones
            </th>{' '}
            {/* Columna Nueva */}
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{patient.firstName}</td>
              <td style={{ padding: '10px' }}>{patient.lastName}</td>
              <td style={{ padding: '10px' }}>{patient.cedula}</td>
              <td style={{ padding: '10px' }}>{patient.phone}</td>
              {/* Botón de borrar 👇 */}
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button
                  onClick={() => handleDelete(patient.id)}
                  style={{
                    padding: '5px 10px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientsList;
