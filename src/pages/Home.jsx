import { useEffect, useState } from 'react';
import { AppBar } from '../components/AppBar';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Home = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    comidas: 0,
    estudiantes: 0,
    colegios: 0,
    calorias: 0,
    proteinas: 0,
    carbohidratos: 0,
    grasas: 0,
    estado: 'Preparando datos...'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setError('');

        const [consumoResponse, estudiantes, colegios] = await Promise.all([
          supabase.from('consumo').select('plato:plato(calorias, proteinas, carbohidratos, grasas)'),
          supabase.from('estudiante').select('*', { count: 'exact', head: true }),
          supabase.from('colegio').select('*', { count: 'exact', head: true })
        ]);

        if (consumoResponse.error) {
          throw consumoResponse.error;
        }

        if (estudiantes.error) {
          throw estudiantes.error;
        }

        if (colegios.error) {
          throw colegios.error;
        }

        const nutritionalTotals = (consumoResponse.data ?? []).reduce(
          (acc, item) => {
            const plato = Array.isArray(item.plato) ? item.plato[0] : item.plato;

            if (!plato) {
              return acc;
            }

            acc.calorias += Number(plato.calorias ?? 0);
            acc.proteinas += Number(plato.proteinas ?? 0);
            acc.carbohidratos += Number(plato.carbohidratos ?? 0);
            acc.grasas += Number(plato.grasas ?? 0);

            return acc;
          },
          { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
        );

        setSummary({
          comidas: consumoResponse.data?.length ?? 0,
          estudiantes: estudiantes.count ?? 0,
          colegios: colegios.count ?? 0,
          calorias: nutritionalTotals.calorias,
          proteinas: nutritionalTotals.proteinas,
          carbohidratos: nutritionalTotals.carbohidratos,
          grasas: nutritionalTotals.grasas,
          estado: 'Seguimiento activo'
        });
      } catch (err) {
        setError(err.message || 'No fue posible cargar los datos básicos de la app');
        setSummary({
          comidas: 0,
          estudiantes: 0,
          colegios: 0,
          calorias: 0,
          proteinas: 0,
          carbohidratos: 0,
          grasas: 0,
          estado: 'Revisa la configuración de Supabase'
        });
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <div>
      <AppBar />
      <div className="home-content">
        <div className="hed">
          <h1>Bienvenido a NutriMetrics</h1>
          <p>Tu herramienta para el seguimiento de la nutrición y el bienestar.</p>
        </div>

        {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}

        <section className="statistics">
          <h2>Estadísticas de NutriMetrics</h2>
          <div className="cards">
            <div className="card">
              <h3>Comidas registradas</h3>
              <p>{loading ? '...' : summary.comidas.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Estudiantes activos</h3>
              <p>{loading ? '...' : summary.estudiantes.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Colegios registrados</h3>
              <p>{loading ? '...' : summary.colegios.toLocaleString()}</p>
            </div>
            <div className="card">
              <h3>Calorías totales registradas</h3>
              <p>{loading ? '...' : `${summary.calorias.toLocaleString()} kcal`}</p>
            </div>
          </div>
        </section>

        <button className="animated-button" onClick={() => navigate('/estadisticas')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
          <span className="text">M Á S</span>
          <span className="circle"></span>
          <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
