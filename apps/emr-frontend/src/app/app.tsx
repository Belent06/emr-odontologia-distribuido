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
import { HistoryPage } from '../pages/HistoryPage';

// 👇 IMPORTAMOS EL CONTEXTO (La "Antena")
import { NotificationProvider } from './context/NotificationContext';

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginPage = location.pathname === '/';

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/');
  };

  return (
    // 👇 ENVOLVEMOS TODO CON EL PROVIDER
    // Así el Snackbar (Toast) puede aparecer encima de cualquier cosa
    <NotificationProvider>
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
          <Route path="/" element={<Login />} />
          <Route path="/patients" element={<PatientsList />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/patients/:id/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
}

export default App;
