import { useEffect, useState } from 'react';
import './Registrarse.css';
import { AppBar } from '../components/AppBar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Registrarse = () => {
  const navigate = useNavigate();
  const [colegios, setColegios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    edad: '',
    grado: '8A',
    estado_nutricional: '',
    peso: '',
    altura: '',
    id_colegio: ''
  });

  useEffect(() => {
    const cargarColegios = async () => {
      try {
        const { data, error: colegiosError } = await supabase
          .from('colegio')
          .select('id_colegio, nombre')
          .order('nombre', { ascending: true });

        if (colegiosError) {
          throw colegiosError;
        }

        setColegios(data ?? []);
      } catch (err) {
        setError(err.message || 'No fue posible cargar los colegios');
      }
    };

    cargarColegios();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.nombre
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (authError) {
        throw authError;
      }

      const insertData = {
        nombre: form.nombre,
        edad: form.edad ? Number(form.edad) : null,
        grado: form.grado,
        estado_nutricional: form.estado_nutricional || null,
        peso: form.peso ? Number(form.peso) : null,
        altura: form.altura ? Number(form.altura) : null,
        id_colegio: form.id_colegio ? Number(form.id_colegio) : null
      };

      const { error: estudianteError } = await supabase.from('estudiante').insert(insertData);

      if (estudianteError) {
        throw estudianteError;
      }

      setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      setForm({
        nombre: '',
        email: '',
        password: '',
        edad: '',
        grado: '8A',
        estado_nutricional: '',
        peso: '',
        altura: '',
        id_colegio: ''
      });
    } catch (err) {
      setError(err.message || 'No fue posible crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register_body">
      <AppBar />
      <div className="registrarse">
        <div className="card_estudiantes">
          <h2>Crear cuenta</h2>
          <p className="subtitle">Regístrate y vincula tu perfil al colegio y al seguimiento nutricional.</p>

          {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}
          {success && <p style={{ color: '#b8f5c5' }}>{success}</p>}

          <form className="form" onSubmit={handleSubmit}>
            <div className="inputForm">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                placeholder="Ingresa tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inputForm">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="correo@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inputForm">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inputForm">
              <label htmlFor="edad">Edad</label>
              <input type="number" id="edad" name="edad" min="1" value={form.edad} onChange={handleChange} />
            </div>

            <div className="inputForm">
              <label htmlFor="grado">Grado</label>
              <input
                type="text"
                id="grado"
                name="grado"
                value={form.grado}
                onChange={handleChange}
                placeholder="Ej. 6A, 10B"
              />
            </div>

            <div className="inputForm">
              <label htmlFor="estado_nutricional">Estado nutricional</label>
              <input
                type="text"
                id="estado_nutricional"
                name="estado_nutricional"
                placeholder="Ej. normal, bajo peso"
                value={form.estado_nutricional}
                onChange={handleChange}
              />
            </div>

            <div className="inputForm">
              <label htmlFor="peso">Peso (kg)</label>
              <input type="number" id="peso" name="peso" min="1" step="0.1" value={form.peso} onChange={handleChange} />
            </div>

            <div className="inputForm">
              <label htmlFor="altura">Altura (m)</label>
              <input
                type="number"
                id="altura"
                name="altura"
                min="0.1"
                step="0.01"
                value={form.altura}
                onChange={handleChange}
              />
            </div>

            <div className="inputForm">
              <label htmlFor="id_colegio">Colegio</label>
              <select id="id_colegio" name="id_colegio" value={form.id_colegio} onChange={handleChange} required>
                <option value="">Selecciona tu colegio</option>
                {colegios.map((colegio) => (
                  <option key={colegio.id_colegio} value={colegio.id_colegio}>
                    {colegio.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <span className="loginRedirect" onClick={() => navigate('/login')}>
              ¿Ya tienes cuenta? Inicia sesión
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};
