import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Conectamos con el Microservicio Auth en el puerto 3000
      const response = await axios.post(
        'http://localhost:3080/api/auth/login',
        {
          email,
          password,
        },
      );

      // Guardamos el token
      const token = response.data.access_token;
      localStorage.setItem('jwt', token);
      console.log('Login exitoso, token guardado:', token);

      // Redirigimos (aunque por ahora solo veremos el cambio de URL)
      navigate('/patients');
    } catch (err) {
      console.error(err);
      setError('Error al iniciar sesión. Verifica tus datos.');
    }
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}
    >
      <div
        style={{
          width: '300px',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      >
        <h2>Login Doctor 👨‍⚕️</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              background: 'blue',
              color: 'white',
              border: 'none',
            }}
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
