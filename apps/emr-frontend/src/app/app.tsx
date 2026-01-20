import {
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import Login from '../pages/login';
import PatientsList from '../pages/patients-list';
import { AppointmentsPage } from '../pages/appointments';
// 👇 1. IMPORTAMOS LA NUEVA PÁGINA DE HISTORIAL
import { HistoryPage } from '../pages/HistoryPage';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Definimos que si la ruta es "/", entonces estamos en el Login
  const isLoginPage = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  return (
    <div>
      {/* --- 🧭 BARRA DE NAVEGACIÓN --- */}
      {!isLoginPage && (
        <nav
          style={{
            padding: '15px',
            borderBottom: '1px solid #ccc',
            background: '#f8f9fa',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* Lado Izquierdo: Links de navegación */}
          <div>
            <Link
              to="/patients"
              style={{
                marginRight: '15px',
                fontWeight: 'bold',
                textDecoration: 'none',
                color: '#333',
              }}
            >
              👥 Pacientes
            </Link>
            <Link
              to="/appointments"
              style={{
                fontWeight: 'bold',
                textDecoration: 'none',
                color: '#333',
              }}
            >
              📅 Agenda
            </Link>
          </div>

          {/* Lado Derecho: Botón de Salir */}
          <button
            onClick={handleLogout}
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              border: '1px solid #ccc',
              padding: '5px 10px',
              borderRadius: '4px',
              background: 'white',
              color: 'red',
            }}
          >
            🚪 Salir
          </button>
        </nav>
      )}

      {/* --- 🛣️ RUTAS DE LA APLICACIÓN --- */}
      <Routes>
        {/* Ruta raíz: Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta /patients: Lista de Pacientes (PostgreSQL) */}
        <Route path="/patients" element={<PatientsList />} />

        {/* Ruta /appointments: Agenda (PostgreSQL) */}
        <Route path="/appointments" element={<AppointmentsPage />} />

        {/* 👇 2. NUEVA RUTA DINÁMICA: Historial (DynamoDB) */}
        {/* :id captura el número de cédula que pasemos en la URL */}
        <Route path="/patients/:id/history" element={<HistoryPage />} />
      </Routes>
    </div>
  );
}

export default App;
