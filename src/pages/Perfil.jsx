import { useEffect, useState } from 'react';
import { AppBar } from '../components/AppBar';
import { supabase } from '../lib/supabase';
import './Perfil.css';
import { useNavigate } from 'react-router-dom';
import { clearStoredSchool } from '../lib/schoolSelection';

export const Perfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [edad, setEdad] = useState(null);
  const [peso, setPeso] = useState(null);
  const [altura, setAltura] = useState(null);
  const [estadoNutricional, setEstadoNutricional] = useState('');
  const [grado, setGrado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(false);
  const [nombreOriginal, setNombreOriginal] = useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data?.user) throw userError;

        setUser(data.user);

        const fullName = data.user.user_metadata?.full_name?.trim();
        setNombreOriginal(fullName);
        if (!fullName) return;

        const { data: estudianteData, error: estudianteError } = await supabase
          .from('estudiante')
          .select('edad, grado, peso, altura, estado_nutricional')
          .eq('nombre', fullName)
          .maybeSingle();

        if (estudianteError) throw estudianteError;

        setEdad(estudianteData?.edad ?? null);
        setGrado(estudianteData?.grado ?? '');
        setPeso(estudianteData?.peso ?? null);
        setAltura(estudianteData?.altura ?? null);
        setEstadoNutricional(estudianteData?.estado_nutricional ?? '');
      } catch (err) {
        setError(err.message || 'No fue posible cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    cargarPerfil();
  }, []);

  const guardarCambios = async () => {
  try {
    setError('');

    // ACTUALIZAR TABLA ESTUDIANTE
    const { error: estudianteError } = await supabase
      .from('estudiante')
      .update({
        nombre: user.user_metadata.full_name,
        edad,
        peso,
        altura,
        grado,
        estado_nutricional: estadoNutricional
      })
      .eq('nombre', nombreOriginal);

    if (estudianteError) {
      throw estudianteError;
    }

    // ACTUALIZAR AUTH USER
    const { error: authError } = await supabase.auth.updateUser({
      email: user.email,
      data: {
        full_name: user.user_metadata.full_name
      }
    });

    if (authError) {
      throw authError;
    }

    setNombreOriginal(user.user_metadata.full_name);

    setEditando(false);
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="perfil-page">
      <AppBar />
      <div className="perfil-container">
        <div className="bg"></div>
        <div className="blob"></div>
        <h1 className="perfil-title">Perfil</h1>

        {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}

        {loading ? (
          <p>Cargando perfil...</p>
        ) : user ? (
          <div className="info">
            <div className="infocont">
              <strong>Nombre</strong>
              {editando ? (
                <input
                  type="text"
                  value={user.user_metadata?.full_name || ''}
                  onChange={(e) =>
                    setUser({ ...user, user_metadata: { ...user.user_metadata, full_name: e.target.value } })
                  }
                />
              ) : (
                <span>{user.user_metadata?.full_name || 'Sin nombre'}</span>
              )}

              <strong>Email</strong>
              {editando ? (
                <input
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              ) : (
                <span>{user.email}</span>
              )}
            </div>

            <div className="infocont">
              <strong>Fecha de registro</strong>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>

              <strong>Edad</strong>
              {editando ? (
                <input type="number" value={edad || ''} onChange={(e) => setEdad(e.target.value)} />
              ) : (
                <span>{edad ?? 'Sin edad'}</span>
              )}
            </div>
            <div className="infocont">
              <strong>Grado</strong>
              {editando ? (
                <input type="text" value={grado || ''} onChange={(e) => setGrado(e.target.value)} />
              ) : (
                <span>{grado || 'Sin grado'}</span>
              )}
              <strong>Peso</strong>
              {editando ? (
                <input type="number" value={peso || ''} onChange={(e) => setPeso(e.target.value)} />
              ) : (
                <span>{peso ?? 'Sin peso'}</span>
              )}
            </div>
            <div className="infocont">
              <strong>Altura</strong>
              {editando ? (
                <input type="number" value={altura || ''} onChange={(e) => setAltura(e.target.value)} />
              ) : (
                <span>{altura ?? 'Sin altura'}</span>
              )}
              <strong>Estado nutricional</strong>
              {editando ? (
                <input
                  type="text"
                  value={estadoNutricional || ''}
                  onChange={(e) => setEstadoNutricional(e.target.value)}
                />
              ) : (
                <span>{estadoNutricional || 'Sin estado nutricional'}</span>
              )}
            </div>
          </div>
        ) : (
          <p>No hay sesión activa. Inicia sesión para ver tu perfil.</p>
        )}
        <div className="buttns">
          <button
            className="btn2"
            onClick={async () => {
              const { error } = await supabase.auth.signOut();
              if (error) setError(error.message);
              else {
                clearStoredSchool();
                setUser(null);
                navigate('/login');
              }
            }}
          >
            Cerrar sesión
          </button>
          <button className="btn2" onClick={() => setEditando(true)}>
            Editar perfil
          </button>
          {editando && (
            <button className="btn2" onClick={guardarCambios}>
              Guardar cambios
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
