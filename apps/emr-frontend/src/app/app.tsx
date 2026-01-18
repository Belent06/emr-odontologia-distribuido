import {
  Route,
  Routes,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'; // 👈 Importamos useLocation y useNavigate
import Login from '../pages/login';
import PatientsList from '../pages/patients-list';
import { AppointmentsPage } from '../pages/appointments';

export function App() {
  const location = useLocation(); // Hook para saber en qué URL estamos
  const navigate = useNavigate(); // Hook para redireccionar

  // Definimos que si la ruta es "/", entonces estamos en el Login
  const isLoginPage = location.pathname === '/';

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('jwt'); // Borramos el token (usando 'jwt' como definimos antes)
    navigate('/'); // Nos manda al login
  };

  return (
    <div>
      {/* --- 🧭 BARRA DE NAVEGACIÓN --- */}
      {/* La condición !isLoginPage significa: "Si NO estamos en el login, muestra el menú" */}
      {!isLoginPage && (
        <nav
          style={{
            padding: '15px',
            borderBottom: '1px solid #ccc',
            background: '#f8f9fa',
            display: 'flex', // 👈 Agregado para alinear mejor
            justifyContent: 'space-between', // Separa menú a la izq y botón a la der
            alignItems: 'center',
          }}
        >
          {/* Lado Izquierdo: Links de navegación */}
          <div>
            {/* ❌ Quitamos el Link de Login, ya no es necesario aquí */}

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

      <Routes>
        {/* Ruta raíz: Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta /patients: Lista de Pacientes (MongoDB) */}
        <Route path="/patients" element={<PatientsList />} />

        {/* Ruta /appointments: Agenda (PostgreSQL) */}
        <Route path="/appointments" element={<AppointmentsPage />} />
      </Routes>
    </div>
  );
}

export default App;
