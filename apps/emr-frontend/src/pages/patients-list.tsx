import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Importamos los tipos desde tu librería compartida
import { IPatient, CreatePatientDto } from '@emr/shared-dtos';

export function PatientsList() {
  // 1. Usamos IPatient en lugar de definir la interfaz a mano
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  // Estado para saber si estamos editando
  const [editingId, setEditingId] = useState<string | null>(null);

  // 2. Tipamos el estado del formulario con una versión flexible de CreatePatientDto
  // (Usamos Partial porque al iniciar los campos están vacíos)
  const [formData, setFormData] = useState<Partial<CreatePatientDto>>({
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
      const response = await axios.get<IPatient[]>(
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

  // --- MODO EDICIÓN ---
  const handleEditClick = (patient: IPatient) => {
    setEditingId(patient.id);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      cedula: patient.cedula,
      phone: patient.phone || '', // phone es opcional en la interfaz, aseguramos string vacío
      email: patient.email,
      // Convertimos la fecha Date a string YYYY-MM-DD para el input type="date"
      birthDate: patient.birthDate
        ? String(patient.birthDate).split('T')[0]
        : '',
    });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      firstName: '',
      lastName: '',
      cedula: '',
      phone: '',
      email: '',
      birthDate: '',
    });
  };
  // --------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.cedula?.length !== 10) {
        alert('⚠️ La cédula debe tener 10 dígitos.');
        return;
      }

      if (editingId) {
        // ACTUALIZAR
        await axios.patch(
          `http://localhost:3333/api/patients/${editingId}`,
          formData,
          authConfig,
        );
        alert('Paciente actualizado ✏️');
      } else {
        // CREAR
        await axios.post(
          'http://localhost:3333/api/patients',
          formData,
          authConfig,
        );
        alert('Paciente creado ✅');
      }

      handleCancel();
      fetchPatients();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Error en la operación';
      alert(`❌ Error: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar paciente?')) return;
    try {
      await axios.delete(
        `http://localhost:3333/api/patients/${id}`,
        authConfig,
      );
      fetchPatients();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

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
        onClick={() => {
          if (showForm) handleCancel();
          else setShowForm(true);
        }}
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
        {showForm ? 'Cancelar Operación' : '+ Nuevo Paciente'}
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
          <h3>
            {editingId ? '✏️ Editando Paciente' : '🆕 Registrar Nuevo Paciente'}
          </h3>

          <form
            onSubmit={handleSubmit}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
            }}
          >
            <input
              placeholder="Nombre"
              required
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Apellido"
              required
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Cédula (10 dígitos)"
              required
              maxLength={10}
              value={formData.cedula}
              onChange={(e) =>
                setFormData({ ...formData, cedula: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              placeholder="Teléfono"
              required
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{ padding: '8px' }}
            />
            <input
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              style={{ padding: '8px' }}
            />

            <button
              type="submit"
              style={{
                gridColumn: 'span 2',
                padding: '10px',
                background: editingId ? '#ffc107' : '#007bff',
                color: editingId ? 'black' : 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {editingId ? 'Actualizar Cambios' : 'Guardar Paciente'}
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
            <th style={{ padding: '10px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{patient.firstName}</td>
              <td style={{ padding: '10px' }}>{patient.lastName}</td>
              <td style={{ padding: '10px' }}>{patient.cedula}</td>
              <td style={{ padding: '10px' }}>{patient.phone}</td>
              <td
                style={{
                  padding: '10px',
                  textAlign: 'center',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={() => handleEditClick(patient)}
                  style={{
                    padding: '5px 10px',
                    background: '#ffc107',
                    color: 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Editar
                </button>
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
