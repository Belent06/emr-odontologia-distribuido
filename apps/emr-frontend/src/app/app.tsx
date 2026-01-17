import { Route, Routes } from 'react-router-dom';
import Login from '../pages/login';
// IMPORTANTE: Aquí importamos el componente nuevo que creaste
import PatientsList from '../pages/patients-list';

export function App() {
  return (
    <Routes>
      {/* Ruta raíz: Muestra el Login */}
      <Route path="/" element={<Login />} />

      {/* Ruta /patients: Ahora muestra la LISTA REAL, no el mensaje de bienvenida */}
      <Route path="/patients" element={<PatientsList />} />
    </Routes>
  );
}

export default App;
