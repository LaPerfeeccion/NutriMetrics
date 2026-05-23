import React, { useEffect, useState } from 'react';
import { AppBar } from '../components/AppBar';
import { supabase } from '../lib/supabase';

export const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        setUser(data.user);
      } catch (err) {
        setError(err.message || 'No fue posible cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  return (
    <div>
      <AppBar></AppBar>
      <div style={{ padding: '2rem' }}>
        <h1>Perfil</h1>

        {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}

        {loading ? (
          <p>Cargando perfil...</p>
        ) : user ? (
          <div>
            <p><strong>Correo:</strong> {user.email}</p>
            <p><strong>Nombre:</strong> {user.user_metadata?.full_name || 'Sin nombre'}</p>
            <p><strong>Estado:</strong> {user.email_confirmed_at ? 'Correo confirmado' : 'Pendiente de confirmación'}</p>
          </div>
        ) : (
          <p>No hay sesión activa. Inicia sesión para ver tu perfil.</p>
        )}
      </div>
    </div>
  );
};
