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
  const [userName, setUserName] = useState('');
  const [miEstudiante, setMiEstudiante] = useState(null);
  const [consumoBusqueda, setConsumoBusqueda] = useState([]);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState('');
  const [busquedaEstudiante, setBusquedaEstudiante] = useState('');
  const [vistaCarga, setVistaCarga] = useState(false);
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

        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        const nombreUsuario = userData.user?.user_metadata?.full_name?.trim() || '';
        setUserName(nombreUsuario);

        const [estudiantesResponse, platosResponse] = await Promise.all([
          supabase.from('estudiante').select('id_estudiante, nombre').order('nombre', { ascending: true }),
          supabase
            .from('plato')
            .select('id_plato, nombre, tipo_comida, calorias, proteinas, carbohidratos, grasas')
            .order('nombre', { ascending: true })
        ]);

        if (estudiantesResponse.error) {
          throw estudiantesResponse.error;
        }

        if (platosResponse.error) {
          throw platosResponse.error;
        }

        const listaEstudiantes = estudiantesResponse.data ?? [];
        const estudianteVinculado = listaEstudiantes.find(
          (estudiante) => estudiante.nombre.trim().toLowerCase() === nombreUsuario.toLowerCase()
        );

        setEstudiantes(listaEstudiantes);
        setPlatos(platosResponse.data ?? []);

        if (estudianteVinculado) {
          setMiEstudiante(estudianteVinculado);
          setForm((prev) => ({
            ...prev,
            id_estudiante: String(estudianteVinculado.id_estudiante)
          }));
        } else {
          setMiEstudiante(null);
          setError(
            'No hay un estudiante vinculado a tu cuenta. No puedes registrar consumo hasta vincular tu nombre con un estudiante.'
          );
        }
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

  const estudiantesFiltrados = useMemo(() => {
    const termino = busquedaEstudiante.trim().toLowerCase();

    if (!termino) {
      return estudiantes;
    }

    return estudiantes.filter((estudiante) => estudiante.nombre.toLowerCase().includes(termino));
  }, [busquedaEstudiante, estudiantes]);

  const platosPorId = useMemo(() => {
    return new Map(platos.map((plato) => [plato.id_plato, plato]));
  }, [platos]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buscarConsumo = async (id_estudiante) => {
    try {
      setVistaCarga(true);
      setError('');
      setSuccess('');

      const { data, error: consumoError } = await supabase
        .from('consumo')
        .select('fecha, observaciones, id_plato')
        .eq('id_estudiante', Number(id_estudiante))
        .order('fecha', { ascending: false });

      if (consumoError) {
        throw consumoError;
      }

      const estudianteSeleccionadoData = estudiantes.find(
        (estudiante) => estudiante.id_estudiante === Number(id_estudiante)
      );

      setEstudianteSeleccionado(estudianteSeleccionadoData?.nombre || 'Estudiante');
      setConsumoBusqueda(
        (data ?? []).map((registro) => ({
          ...registro,
          plato: platosPorId.get(registro.id_plato) ?? null
        }))
      );
    } catch (err) {
      setError(err.message || 'No fue posible cargar el consumo del estudiante');
    } finally {
      setVistaCarga(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (!miEstudiante) {
        throw new Error('No tienes un estudiante vinculado a tu cuenta.');
      }

      const { error: insertError } = await supabase.from('consumo').insert({
        fecha: form.fecha,
        observaciones: form.observaciones,
        id_estudiante: Number(miEstudiante.id_estudiante),
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

      if (miEstudiante) {
        await buscarConsumo(miEstudiante.id_estudiante);
      }
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
          <p>
            {miEstudiante
              ? `Solo puedes registrar consumo para ${miEstudiante.nombre}.`
              : 'Tu cuenta aún no está vinculada a un estudiante.'}
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div className="inputForm">
              <label htmlFor="id_estudiante">Estudiante</label>
              <input
                id="id_estudiante"
                value={miEstudiante ? miEstudiante.nombre : 'Sin estudiante vinculado'}
                disabled
              />
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
                  {selectedPlato.tipo_comida} · {selectedPlato.calorias ?? 0} kcal · Proteínas:{' '}
                  {selectedPlato.proteinas ?? 0} g · Carbohidratos: {selectedPlato.carbohidratos ?? 0} g · Grasas:{' '}
                  {selectedPlato.grasas ?? 0} g
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

            <button className="btn" type="submit" disabled={loading || !miEstudiante}>
              {loading ? 'Cargando...' : 'Registrar consumo'}
            </button>
          </form>
        </div>

        <div className="generalConsumo">
          <div className="prs">
            <h2 className="r2">Buscar estudiante</h2>
            <p>Busca por nombre para ver el consumo de cualquier estudiante y revisar su historial.</p>

            <div className="inputForm">
              <label htmlFor="buscarEstudiante">Nombre del estudiante</label>
              <input
                id="buscarEstudiante"
                type="text"
                placeholder="Escribe el nombre"
                value={busquedaEstudiante}
                onChange={(event) => setBusquedaEstudiante(event.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {estudiantesFiltrados.map((estudiante) => (
                <button
                  key={estudiante.id_estudiante}
                  type="button"
                  className="btn"
                  style={{ width: '100%', textAlign: 'left' }}
                  onClick={() => buscarConsumo(estudiante.id_estudiante)}
                >
                  {estudiante.nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="bgr">
            {vistaCarga && <p>Cargando historial...</p>}
            {estudianteSeleccionado && !vistaCarga && (
              <div className="inputForm" style={{ marginTop: '1rem' }}>
                <strong>Historial de {estudianteSeleccionado}</strong>

                {consumoBusqueda.length === 0 ? (
                  <p>No hay consumos registrados para este estudiante.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                    {consumoBusqueda.map((registro, index) => (
                      <div
                        key={`${registro.fecha}-${registro.id_plato}-${index}`}
                        style={{ border: '1px solid #dbeafe', borderRadius: '12px', padding: '0.75rem' }}
                      >
                        <p>
                          <strong>Fecha:</strong> {registro.fecha}
                        </p>
                        <p>
                          <strong>Plato:</strong> {registro.plato?.nombre || 'Plato no disponible'}
                        </p>
                        <p>
                          <strong>Tipo:</strong> {registro.plato?.tipo_comida || 'Sin tipo'}
                        </p>
                        <p>
                          <strong>Observaciones:</strong> {registro.observaciones || 'Sin observaciones'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
