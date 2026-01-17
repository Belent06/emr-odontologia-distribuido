import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  cedula: string; // <--- CAMBIO: Antes era govId
  email: string;
  birthDate: string;
}

export function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);

  // Estado del formulario corregido
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    cedula: '', // <--- CAMBIO: Antes era govId
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
      setError('Error al cargar datos.');
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Validamos manualmente la longitud antes de enviar para evitar el error del servidor
      if (newPatient.cedula.length !== 10) {
        alert('⚠️ La cédula debe tener exactamente 10 dígitos.');
        return;
      }

      console.log('Enviando datos:', newPatient);

      await axios.post(
        'http://localhost:3333/api/patients',
        newPatient,
        authConfig,
      );

      setShowForm(false);
      // Limpiamos el formulario
      setNewPatient({
        firstName: '',
        lastName: '',
        cedula: '',
        phone: '',
        email: '',
        birthDate: '',
      });
      fetchPatients();
      alert('Paciente creado con éxito ✅');
    } catch (err: any) {
      console.error(err);
      const backendMessage =
        err.response?.data?.message || 'Error al crear paciente';
      // Muestra el error exacto que envía el backend
      alert(
        `❌ Error: ${Array.isArray(backendMessage) ? backendMessage.join(', ') : backendMessage}`,
      );
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '900px',
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

            {/* INPUT DE CÉDULA CORREGIDO 👇 */}
            <input
              placeholder="Cédula (10 dígitos)"
              required
              maxLength={10} // Ayuda visual
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

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '0.8rem', color: '#666' }}>
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                required
                value={newPatient.birthDate}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, birthDate: e.target.value })
                }
                style={{ padding: '8px' }}
              />
            </div>

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
            <th style={{ padding: '10px' }}>Nombre</th>
            <th style={{ padding: '10px' }}>Apellido</th>
            <th style={{ padding: '10px' }}>Cédula</th> {/* Cambiado título */}
            <th style={{ padding: '10px' }}>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{patient.firstName}</td>
              <td style={{ padding: '10px' }}>{patient.lastName}</td>
              <td style={{ padding: '10px' }}>{patient.cedula}</td>{' '}
              {/* Cambiado dato */}
              <td style={{ padding: '10px' }}>{patient.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientsList;
