import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IPatient, CreatePatientDto } from '@emr/shared-dtos';

// --- IMPORTS DE MATERIAL UI ---
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Toolbar,
  AppBar,
  Box,
} from '@mui/material';

// --- ICONOS ---
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';

export function PatientsList() {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [loading, setLoading] = useState(true);

  // Controla si la ventana modal (Dialog) está abierta o cerrada
  const [open, setOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

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
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

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
        'http://localhost:3080/api/patients',
        authConfig,
      );
      setPatients(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- ABRIR/CERRAR MODAL ---
  const handleOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
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

  const handleEditClick = (patient: IPatient) => {
    setEditingId(patient.id);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      cedula: patient.cedula,
      phone: patient.phone || '',
      email: patient.email,
      birthDate: patient.birthDate
        ? String(patient.birthDate).split('T')[0]
        : '',
    });
    setOpen(true); // Abrimos el modal con los datos cargados
  };

  const handleSubmit = async () => {
    try {
      if (formData.cedula?.length !== 10) {
        alert('⚠️ La cédula debe tener 10 dígitos.');
        return;
      }

      if (editingId) {
        await axios.patch(
          `http://localhost:3080/api/patients/${editingId}`,
          formData,
          authConfig,
        );
      } else {
        // CORRECCIÓN AQUÍ: Comillas simples en ambos lados
        await axios.post(
          'http://localhost:3080/api/patients',
          formData,
          authConfig,
        );
      }

      handleClose();
      fetchPatients();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error en la operación';
      alert(`❌ Error: ${Array.isArray(msg) ? msg.join(', ') : msg}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar paciente?')) return;
    try {
      await axios.delete(
        `http://localhost:3080/api/patients/${id}`,
        authConfig,
      );
      fetchPatients();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  if (loading)
    return <Typography sx={{ p: 4 }}>Cargando sistema...</Typography>;

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* BARRA SUPERIOR (APPBAR) */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            EMR Odontológico 🦷
          </Typography>
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={() => {
              localStorage.removeItem('jwt');
              navigate('/');
            }}
          >
            Salir
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* ENCABEZADO Y BOTÓN DE AGREGAR */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography
            variant="h4"
            component="h1"
            color="primary"
            fontWeight="bold"
          >
            Lista de Pacientes
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<PersonAddIcon />}
            onClick={handleOpen}
            size="large"
          >
            Nuevo Paciente
          </Button>
        </Stack>

        {/* TABLA DE PACIENTES (PAPER + TABLE) */}
        <TableContainer component={Paper} elevation={3}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ bgcolor: '#eeeeee' }}>
              <TableRow>
                <TableCell>
                  <strong>Nombre</strong>
                </TableCell>
                <TableCell>
                  <strong>Apellido</strong>
                </TableCell>
                <TableCell>
                  <strong>Cédula</strong>
                </TableCell>
                <TableCell>
                  <strong>Email</strong>
                </TableCell>
                <TableCell>
                  <strong>Teléfono</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>{patient.firstName}</TableCell>
                  <TableCell>{patient.lastName}</TableCell>
                  <TableCell>{patient.cedula}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditClick(patient)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(patient.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {patients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography sx={{ py: 3, color: 'text.secondary' }}>
                      No hay pacientes registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* VENTANA MODAL (DIALOG) PARA CREAR/EDITAR */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingId ? '✏️ Editar Paciente' : '🆕 Registrar Nuevo Paciente'}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Nombre"
                  fullWidth
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
                <TextField
                  label="Apellido"
                  fullWidth
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </Stack>

              <TextField
                label="Cédula"
                fullWidth
                value={formData.cedula}
                onChange={(e) =>
                  setFormData({ ...formData, cedula: e.target.value })
                }
                inputProps={{ maxLength: 10 }}
                helperText="Debe tener 10 dígitos"
              />

              <TextField
                label="Email"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <Stack direction="row" spacing={2}>
                <TextField
                  label="Teléfono"
                  fullWidth
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <TextField
                  label="Fecha Nacimiento"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default PatientsList;
