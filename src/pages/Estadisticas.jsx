import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import './Estadisticas.css';
import { AppBar } from '../components/AppBar';
import { supabase } from '../lib/supabase';

export const Estadisticas = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);

  useEffect(() => {
    const loadConsumptionData = async () => {
      setLoading(true);
      setError('');

      try {
        const [consumoResponse, estudiantesResponse] = await Promise.all([
          supabase
            .from('consumo')
            .select('fecha, plato:plato(calorias)')
            .order('fecha', { ascending: true }),
          supabase.from('estudiante').select('*', { count: 'exact', head: true })
        ]);

        if (consumoResponse.error) {
          throw consumoResponse.error;
        }

        if (estudiantesResponse.error) {
          throw estudiantesResponse.error;
        }

        const totalsByDate = new Map();

        (consumoResponse.data ?? []).forEach((item) => {
          const date = item.fecha ? new Date(item.fecha) : null;

          if (!date || Number.isNaN(date.getTime())) {
            return;
          }

          const isoDate = date.toISOString().slice(0, 10);
          const plato = Array.isArray(item.plato) ? item.plato[0] : item.plato;
          const current = totalsByDate.get(isoDate) ?? { calorias: 0, comidas: 0 };

          totalsByDate.set(isoDate, {
            calorias: current.calorias + Number(plato?.calorias ?? 0),
            comidas: current.comidas + 1
          });
        });

        const nextChartData = Array.from(totalsByDate.entries()).map(([isoDate, valores]) => ({
          day: new Date(isoDate).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: 'short'
          }),
          calorias: valores.calorias,
          comidas: valores.comidas
        }));

        setChartData(nextChartData);
        setTotalEstudiantes(estudiantesResponse.count ?? 0);
      } catch (err) {
        setError(err.message || 'No fue posible cargar el consumo real');
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    loadConsumptionData();
  }, []);

  return (
    <div className="estadisticas-container">
      <AppBar />
      <section className="estadisticas-views">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Platos registrados</div>
            <div className="stat-value">{chartData.reduce((acc, item) => acc + item.comidas, 0)}</div>
          </div>
        </div>
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Estudiantes totales</div>
            <div className="stat-value">{totalEstudiantes}</div>
          </div>
        </div>
      </section>

      {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}

      <div className="chart-container">
        <h2>Calorías por fecha</h2>

        {loading ? (
          <p>Cargando consumo real...</p>
        ) : chartData.length === 0 ? (
          <p>No hay platos registrados aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart barSize={'60'} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" />
              <YAxis className="sta" tick={{ fill: '#0691aa', fontSize: 14 }} />
              <Tooltip />
              <Bar dataKey="calorias" radius={[20, 20, 0, 0]} fill="#0ca6c2" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-container">
        <h2>Número de comidas por fecha</h2>

        {loading ? (
          <p>Cargando consumo real...</p>
        ) : chartData.length === 0 ? (
          <p>No hay platos registrados aún.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart barSize={'60'} data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" />
              <YAxis className="sta" tick={{ fill: '#0691aa', fontSize: 14 }} />
              <Tooltip />
              <Bar dataKey="comidas" radius={[20, 20, 0, 0]} fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Estadisticas;
