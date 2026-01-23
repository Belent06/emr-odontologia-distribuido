import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppointmentService } from '../services/appointments.service';
import { PatientService } from '../services/patients.service';

// --- MATERIAL UI IMPORTS ---
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  InputAdornment,
  Divider,
} from '@mui/material';

// --- ICONOS ---
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

// --- INTERFACES ---
interface Appointment {
  id: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  doctorId: string;
  patientId: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  cedula: string;
}

// --- UTILIDAD PARA EL TOKEN ---
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
  // --- ESTADOS DE DATOS ---
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DE FORMULARIO DE CREACIÓN ---
  const [searchCedula, setSearchCedula] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    doctorId: '',
    reason: '',
  });

  // --- ESTADOS PARA MODAL DE COMPLETAR ---
  const [openModal, setOpenModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState<string | null>(null);
  const [medicalNotes, setMedicalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('jwt');
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- INICIALIZACIÓN ---
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    loadData();
    autoFillDoctor();
  }, []);

  const loadData = async () => {
    try {
      const [apptData, patientsData] = await Promise.all([
        AppointmentService.getAll(),
        PatientService.getAll(),
      ]);

      const sorted = (apptData as Appointment[]).sort((a, b) => {
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setAppointments(sorted);
      setPatients(patientsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Error cargando datos del servidor.');
      setLoading(false);
    }
  };

  const autoFillDoctor = () => {
    if (token) {
      const payload = getPayloadFromToken(token);
      if (payload && payload.sub) {
        setFormData((prev) => ({ ...prev, doctorId: payload.sub }));
      }
    }
  };

  // --- LÓGICA DE BÚSQUEDA DE PACIENTE ---
  const handleSearchPatient = () => {
    if (!searchCedula) return;
    const found = patients.find((p) => p.cedula === searchCedula);
    if (found) {
      setSelectedPatient(found);
    } else {
      setSelectedPatient(null);
      alert('❌ Paciente no encontrado con esa cédula.');
    }
  };

  // --- LÓGICA DE CREAR CITA ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      alert('⚠️ Por favor busca y selecciona un paciente.');
      return;
    }

    try {
      setLoading(true);
      const isoDate = new Date(
        `${formData.date}T${formData.time}`,
      ).toISOString();

      await AppointmentService.create({
        date: isoDate,
        doctorId: formData.doctorId,
        patientId: selectedPatient.id,
        reason: formData.reason,
      });

      alert('✅ Cita agendada con éxito');
      loadData();

      setFormData((prev) => ({ ...prev, date: '', time: '', reason: '' }));
      setSelectedPatient(null);
      setSearchCedula('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear cita';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE COMPLETAR CITA ---
  const handleOpenComplete = (id: string) => {
    setSelectedApptId(id);
    setMedicalNotes('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedApptId(null);
  };

  const confirmCompletion = async () => {
    if (!medicalNotes.trim()) {
      alert('⚠️ Es necesario ingresar las notas clínicas.');
      return;
    }

    setProcessing(true);
    try {
      await axios.patch(
        `http://localhost:3080/api/appointments/${selectedApptId}/status`,
        {
          status: 'COMPLETED',
          notes: medicalNotes,
        },
        authConfig,
      );

      await loadData();
      handleCloseModal();
      // Feedback más profesional
      alert('✅ Consulta registrada exitosamente en el expediente.');
    } catch (error) {
      console.error(error);
      alert('❌ Error al completar la cita.');
    } finally {
      setProcessing(false);
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

  const getPatientName = (patientId: string) => {
    const p = patients.find((pat) => pat.id === patientId);
    return p ? `${p.firstName} ${p.lastName}` : 'Desconocido';
  };

  const getStatusChip = (status: string) => {
    const map: any = {
      PENDING: { color: 'warning', label: 'Pendiente' },
      COMPLETED: { color: 'success', label: 'Finalizada' },
      CANCELLED: { color: 'error', label: 'Cancelada' },
    };
    const conf = map[status] || { color: 'default', label: status };
    return (
      <Chip
        label={conf.label}
        color={conf.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (loading && appointments.length === 0)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* --- NAVBAR --- */}
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <EventIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión de Agenda
          </Typography>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            startIcon={<LogoutIcon />}
          >
            Menú Principal
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* --- FORMULARIO DE NUEVA CITA --- */}
        <Card sx={{ mb: 4, p: 2, boxShadow: 3 }}>
          <Typography
            variant="h6"
            color="primary"
            gutterBottom
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 'bold',
            }}
          >
            <EventIcon /> Agendar Nueva Cita
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <CardContent>
            <form onSubmit={handleSubmit}>
              {/* 👇 SOLUCIÓN ERROR GRID: Usamos Stack que es más robusto y responsivo */}
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* COLUMNA 1: Selección de Paciente */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    1. Identificar Paciente
                  </Typography>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <TextField
                      label="Cédula de Identidad"
                      size="small"
                      fullWidth
                      value={searchCedula}
                      onChange={(e) => setSearchCedula(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleSearchPatient}
                              edge="end"
                              color="primary"
                            >
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  {selectedPatient && (
                    <Chip
                      icon={<PersonIcon />}
                      label={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                      color="success"
                      variant="outlined"
                      sx={{
                        mt: 1,
                        width: '100%',
                        justifyContent: 'flex-start',
                      }}
                    />
                  )}
                </Box>

                {/* COLUMNA 2: Fecha y Hora */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    2. Definir Horario
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      type="date"
                      label="Fecha"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                    <TextField
                      type="time"
                      label="Hora"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      required
                    />
                  </Stack>
                </Box>

                {/* COLUMNA 3: Detalles y Botón */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    3. Detalles Clínicos
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      label="Doctor Asignado"
                      size="small"
                      fullWidth
                      value={formData.doctorId}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">Dr.</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Motivo de Consulta"
                      size="small"
                      fullWidth
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      required
                      placeholder="Ej. Dolor, Limpieza..."
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                    >
                      Agendar
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* --- TABLA DE CITAS --- */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#333' }}
        >
          📅 Agenda del Día
        </Typography>
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead sx={{ bgcolor: '#37474f' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>
                  <strong>Fecha / Hora</strong>
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  <strong>Paciente</strong>
                </TableCell>
                <TableCell sx={{ color: 'white' }}>
                  <strong>Motivo</strong>
                </TableCell>
                <TableCell sx={{ color: 'white' }} align="center">
                  <strong>Estado</strong>
                </TableCell>
                <TableCell sx={{ color: 'white' }} align="center">
                  <strong>Acciones</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(appt.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(appt.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getPatientName(appt.patientId)}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      ID: {appt.patientId}
                    </Typography>
                  </TableCell>
                  <TableCell>{appt.reason}</TableCell>
                  <TableCell align="center">
                    {getStatusChip(appt.status)}
                  </TableCell>
                  <TableCell align="center">
                    {/* ACCIONES */}
                    {appt.status === 'PENDING' && (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip title="Registrar Atención (Completar)">
                          <IconButton
                            color="success"
                            onClick={() => handleOpenComplete(appt.id)}
                          >
                            <CheckCircleIcon fontSize="large" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Cancelar Cita">
                          <IconButton
                            color="error"
                            onClick={() => handleCancel(appt.id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}

                    {appt.status === 'COMPLETED' && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'green',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />{' '}
                        Atendido
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography py={3} color="text.secondary">
                      No hay citas programadas.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* --- MODAL DE COMPLETAR CITA (DIALOG CORREGIDO) --- */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            bgcolor: '#e8f5e9',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <NoteAddIcon /> Registro Clínico
        </DialogTitle>
        <DialogContent dividers>
          {/* 👇 TEXTO EDITADO PARA EL DOCTOR */}
          <Typography variant="body1" color="text.primary" paragraph>
            <strong>Finalizar Consulta Médica</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Por favor, ingrese las notas de evolución, diagnóstico y tratamiento
            realizado. Esta información se registrará permanentemente en el
            expediente del paciente.
          </Typography>

          <TextField
            autoFocus
            label="Notas de Evolución / Tratamiento"
            multiline
            rows={5}
            fullWidth
            variant="outlined"
            placeholder="Ej: Paciente asintomático. Se realizó profilaxis..."
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            helperText="Esta información será visible en el Historial del Paciente."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseModal}
            color="inherit"
            disabled={processing}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmCompletion}
            variant="contained"
            color="success"
            disabled={processing}
            startIcon={
              processing ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircleIcon />
              )
            }
          >
            {processing ? 'Guardando...' : 'Finalizar Consulta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
