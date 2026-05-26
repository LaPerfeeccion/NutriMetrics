import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { readStoredSchool } from './lib/schoolSelection';

import { Home } from './pages/Home';
import { Estadisticas } from './pages/Estadisticas';
import { Consumo } from './pages/Consumo';
import { Registrarse } from './pages/Registrarse';
import { Perfil } from './pages/Perfil';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Footer } from './components/Footer';

function App() {
  const [idProveedor, setIdProveedor] = useState(null);

  useEffect(() => {
    const cargarIdProveedor = async () => {
      // (Opcional) si tienes guardado el colegio, podrías intentar usarlo.
      // Pero como tu relacion proveedor->colegio se hace mejor con id_colegio desde estudiante,
      // seguimos el camino con auth.
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          setIdProveedor(null);
          return;
        }

        const fullName = userData.user.user_metadata?.full_name?.trim();
        if (!fullName) {
          setIdProveedor(null);
          return;
        }

        const { data: estudianteData, error: estudianteError } = await supabase
          .from('estudiante')
          .select('id_colegio')
          .eq('nombre', fullName)
          .maybeSingle();

        if (estudianteError || !estudianteData?.id_colegio) {
          setIdProveedor(null);
          return;
        }

        const { data: colegioData, error: colegioError } = await supabase
          .from('colegio')
          .select('id_proveedor')
          .eq('id_colegio', estudianteData.id_colegio)
          .maybeSingle();

        if (colegioError) {
          setIdProveedor(null);
          return;
        }

        setIdProveedor(colegioData?.id_proveedor ?? null);
      } catch {
        setIdProveedor(null);
      }
    };

    cargarIdProveedor();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route
          path="/consumo"
          element={
            <ProtectedRoute>
              <Consumo />
            </ProtectedRoute>
          }
        />
        <Route path="/registrarse" element={<Registrarse />} />
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>

      {idProveedor ? <Footer idProveedor={idProveedor} /> : null}
    </BrowserRouter>
  );
}

export default App;