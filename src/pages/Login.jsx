import { useEffect, useState } from 'react';
import './Login.css';
import { AppBar } from '../components/AppBar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const comprobarSesion = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/perfil');
      }
    };

    comprobarSesion();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      setError(authError.message || 'No fue posible iniciar sesión');
      setLoading(false);
      return;
    }

    navigate('/perfil');
  };

  return (
    <div className="login_body">
      <AppBar></AppBar>
      <div className="login">
        <div className="card_estudiantes">
          <h2>Iniciar Sesión</h2>

          <p className="subtitle">
            Accede a NutriMetrics para monitorear el consumo alimenticio.
          </p>

          {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="inputForm">
              <label htmlFor="correo">Correo electrónico</label>
              <input
                type="email"
                id="correo"
                placeholder="correo@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>

            <div className="inputForm">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>

            <span className="loginRedirect" onClick={() => navigate('/registrarse')}>
              ¿No tienes cuenta? Regístrate
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;