import { useEffect, useState } from 'react';
import './AppBar.css';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { FaUserCircle } from 'react-icons/fa';
import { AiFillHome } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { readStoredSchool } from '../lib/schoolSelection';

export const AppBar = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedPage, setSelectedPage] = useState('');

  useEffect(() => {
    const cargarNombreColegio = async () => {
      const storedSchool = readStoredSchool();

      if (storedSchool?.nombre) {
        setSchoolName(storedSchool.nombre);
        return;
      }

      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();

        if (userError || !userData.user) {
          setSchoolName('');
          return;
        }

        const fullName =
          userData.user.user_metadata?.full_name?.trim();

        if (!fullName) {
          setSchoolName('');
          return;
        }

        const { data: estudianteData, error: estudianteError } =
          await supabase
            .from('estudiante')
            .select('id_colegio')
            .eq('nombre', fullName)
            .maybeSingle();

        if (estudianteError) {
          throw estudianteError;
        }

        if (!estudianteData?.id_colegio) {
          setSchoolName('');
          return;
        }

        const { data: colegioData, error: colegioError } =
          await supabase
            .from('colegio')
            .select('nombre')
            .eq('id_colegio', estudianteData.id_colegio)
            .maybeSingle();

        if (colegioError) {
          throw colegioError;
        }

        setSchoolName(colegioData?.nombre || '');
      } catch {
        setSchoolName('');
      }
    };

    cargarNombreColegio();
  }, []);

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Estadísticas', path: '/estadisticas' },
    { name: 'Consumo', path: '/consumo' },
    { name: 'Perfil', path: '/perfil' },
    { name: 'Registrarse', path: '/registrarse' },
    { name: 'Login', path: '/login' }
  ];

  const filteredPages = pages.filter((page) =>
    page.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-bar">
      <section className="app-title">
        <h1>NutriMetrics</h1>
        <h4>{schoolName || 'Seguimiento escolar'}</h4>
      </section>

      <div className="contenedor-separador">
        <div className="linea-vertical"></div>
      </div>

      {/* SEARCH */}

      <div role="search" className="search-container">
        <FaMagnifyingGlass className="icon" />

        <input
          className="inrp"
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {search && (
          <div className="search-results">
            {filteredPages.map((page) => (
              <div
                key={page.path}
                className="search-item"
                onClick={() => {
                  navigate(page.path);
                  setSearch('');
                }}
              >
                {page.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="contenedor-separador">
        <div className="linea-vertical"></div>
      </div>

      {/* SELECT */}

      <select
        className="page-select"
        value={selectedPage}
        onChange={(e) => {
          setSelectedPage(e.target.value);

          if (e.target.value) {
            navigate(e.target.value);
          }
        }}
      >
        <option value="">Ir a...</option>

        {pages.map((page) => (
          <option key={page.path} value={page.path}>
            {page.name}
          </option>
        ))}
      </select>

      <div className="contenedor-separador">
        <div className="linea-vertical"></div>
      </div>

      <section className="app-actions">
        <AiFillHome
          className="action-icon"
          onClick={() => navigate('/')}
        />

        <FaUserCircle
          className="action-icon"
          onClick={() => navigate('/perfil')}
        />
      </section>
    </div>
  );
};