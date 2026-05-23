import { useEffect, useMemo, useState } from 'react';
import './Consumo.css';
import { AppBar } from '../components/AppBar';
import { supabase } from '../lib/supabase';

export const Consumo = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    id_estudiante: '',
    id_plato: '',
    fecha: new Date().toISOString().slice(0, 10),
    observaciones: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError('');

        const [estudiantesResponse, platosResponse] = await Promise.all([
          supabase.from('estudiante').select('id_estudiante, nombre').order('nombre', { ascending: true }),
          supabase.from('plato').select('id_plato, nombre, tipo_comida, calorias, proteinas, carbohidratos, grasas').order('nombre', { ascending: true })
        ]);

        if (estudiantesResponse.error) {
          throw estudiantesResponse.error;
        }

        if (platosResponse.error) {
          throw platosResponse.error;
        }

        setEstudiantes(estudiantesResponse.data ?? []);
        setPlatos(platosResponse.data ?? []);
      } catch (err) {
        setError(err.message || 'No fue posible cargar estudiantes y platos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const selectedPlato = useMemo(() => {
    return platos.find((plato) => plato.id_plato === Number(form.id_plato)) ?? null;
  }, [form.id_plato, platos]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase.from('consumo').insert({
        fecha: form.fecha,
        observaciones: form.observaciones,
        id_estudiante: Number(form.id_estudiante),
        id_plato: Number(form.id_plato)
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess('Consumo registrado correctamente');
      setForm((prev) => ({
        ...prev,
        observaciones: ''
      }));
    } catch (err) {
      setError(err.message || 'No fue posible guardar el consumo');
    }
  };

  return (
    <div className="consumoBd">
      <AppBar />
      <div className="principalConsumo">
        <h1>Registro de consumo alimenticio</h1>

        {error && <p style={{ color: '#ffb4b4' }}>{error}</p>}
        {success && <p style={{ color: '#b8f5c5' }}>{success}</p>}

        <div className="card_estudiantes">
          <h2>Registra tu consumo</h2>
          <p>Selecciona el estudiante y el plato consumido para registrar el consumo diario.</p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="inputForm">
              <label htmlFor="id_estudiante">Estudiante</label>
              <select id="id_estudiante" name="id_estudiante" value={form.id_estudiante} onChange={handleChange} required disabled={loading}>
                <option value="">Selecciona un estudiante</option>
                {estudiantes.map((estudiante) => (
                  <option key={estudiante.id_estudiante} value={estudiante.id_estudiante}>
                    {estudiante.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="inputForm">
              <label htmlFor="fecha">Fecha de consumo</label>
              <input type="date" id="fecha" name="fecha" value={form.fecha} onChange={handleChange} required />
            </div>

            <div className="inputForm">
              <label htmlFor="id_plato">Plato consumido</label>
              <select id="id_plato" name="id_plato" value={form.id_plato} onChange={handleChange} required>
                <option value="">Selecciona un plato</option>
                {platos.map((plato) => (
                  <option key={plato.id_plato} value={plato.id_plato}>
                    {plato.nombre} · {plato.tipo_comida}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlato && (
              <div className="inputForm">
                <strong>Información nutricional del plato</strong>
                <p>
                  {selectedPlato.tipo_comida} · {selectedPlato.calorias ?? 0} kcal · Proteínas: {selectedPlato.proteinas ?? 0} g ·
                  Carbohidratos: {selectedPlato.carbohidratos ?? 0} g · Grasas: {selectedPlato.grasas ?? 0} g
                </p>
              </div>
            )}

            <div className="inputForm">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                rows="3"
                value={form.observaciones}
                onChange={handleChange}
                placeholder="Ej. Consumió toda la porción"
              />
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Cargando...' : 'Registrar consumo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
