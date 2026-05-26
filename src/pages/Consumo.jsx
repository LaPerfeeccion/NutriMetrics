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

        if (userError) throw userError;

        const nombreUsuario =
          userData.user?.user_metadata?.full_name?.trim() || '';

        const [estudiantesResponse, platosResponse] = await Promise.all([
          supabase
            .from('estudiante')
            .select('id_estudiante, nombre')
            .order('nombre', { ascending: true }),

          supabase
            .from('plato')
            .select(
              'id_plato, nombre, tipo_comida, calorias, proteinas, carbohidratos, grasas'
            )
            .order('nombre', { ascending: true })
        ]);

        if (estudiantesResponse.error) throw estudiantesResponse.error;
        if (platosResponse.error) throw platosResponse.error;

        const listaEstudiantes = estudiantesResponse.data ?? [];

        const estudianteVinculado = listaEstudiantes.find(
          (estudiante) =>
            estudiante.nombre.trim().toLowerCase() ===
            nombreUsuario.toLowerCase()
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
          setError(
            'No hay un estudiante vinculado a tu cuenta.'
          );
        }
      } catch (err) {
        setError(err.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const selectedPlato = useMemo(() => {
    return (
      platos.find(
        (plato) => plato.id_plato === Number(form.id_plato)
      ) ?? null
    );
  }, [form.id_plato, platos]);

  const estudiantesFiltrados = useMemo(() => {
    const termino = busquedaEstudiante.trim().toLowerCase();

    if (!termino) return estudiantes;

    return estudiantes.filter((estudiante) =>
      estudiante.nombre.toLowerCase().includes(termino)
    );
  }, [busquedaEstudiante, estudiantes]);

  const platosPorId = useMemo(() => {
    return new Map(
      platos.map((plato) => [plato.id_plato, plato])
    );
  }, [platos]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const buscarConsumo = async (id_estudiante) => {
    try {
      setVistaCarga(true);
      setError('');
      setSuccess('');

      const { data, error } = await supabase
        .from('consumo')
        .select(
          'id_consumo, fecha, observaciones, id_plato, id_estudiante'
        )
        .eq('id_estudiante', Number(id_estudiante))
        .order('fecha', { ascending: false });

      if (error) throw error;

      const estudianteData = estudiantes.find(
        (e) => e.id_estudiante === Number(id_estudiante)
      );

      setEstudianteSeleccionado(
        estudianteData?.nombre || 'Estudiante'
      );

      setConsumoBusqueda(
        (data ?? []).map((registro) => ({
          ...registro,
          plato: platosPorId.get(registro.id_plato) ?? null
        }))
      );
    } catch (err) {
      setError(err.message || 'Error buscando consumo');
    } finally {
      setVistaCarga(false);
    }
  };

  const eliminarConsumo = async (
    id_consumo,
    id_estudiante
  ) => {
    try {
      setError('');
      setSuccess('');

      if (!miEstudiante) {
        throw new Error('No tienes permisos.');
      }

      if (
        miEstudiante.id_estudiante !== id_estudiante
      ) {
        throw new Error(
          'Solo puedes eliminar tus propios registros.'
        );
      }

      const { error } = await supabase
        .from('consumo')
        .delete()
        .eq('id_consumo', id_consumo);

      if (error) throw error;

      setSuccess('Registro eliminado correctamente');

      await buscarConsumo(id_estudiante);
    } catch (err) {
      setError(err.message || 'Error eliminando registro');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setError('');
      setSuccess('');

      if (!miEstudiante) {
        throw new Error(
          'No tienes un estudiante vinculado.'
        );
      }

      const { error } = await supabase
        .from('consumo')
        .insert({
          fecha: form.fecha,
          observaciones: form.observaciones,
          id_estudiante: Number(
            miEstudiante.id_estudiante
          ),
          id_plato: Number(form.id_plato)
        });

      if (error) throw error;

      setSuccess('Consumo registrado correctamente');

      setForm((prev) => ({
        ...prev,
        observaciones: ''
      }));

      await buscarConsumo(
        miEstudiante.id_estudiante
      );
    } catch (err) {
      setError(err.message || 'Error guardando consumo');
    }
  };

  return (
    <div className="consumoBd">
      <AppBar />

      <div className="principalConsumo">
        <h1>Registro de consumo alimenticio</h1>

        {error && (
          <p style={{ color: '#ffb4b4' }}>
            {error}
          </p>
        )}

        {success && (
          <p style={{ color: '#b8f5c5' }}>
            {success}
          </p>
        )}

        <div className="card_estudiantes">
          <h2>Registrar consumo</h2>

          <form className="form" onSubmit={handleSubmit}>
            <div className="inputForm">
              <label>Estudiante</label>

              <input
                value={
                  miEstudiante
                    ? miEstudiante.nombre
                    : 'Sin estudiante'
                }
                disabled
              />
            </div>

            <div className="inputForm">
              <label>Fecha</label>

              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="inputForm">
              <label>Plato</label>

              <select
                name="id_plato"
                value={form.id_plato}
                onChange={handleChange}
                required
              >
                <option value="">
                  Selecciona un plato
                </option>

                {platos.map((plato) => (
                  <option
                    key={plato.id_plato}
                    value={plato.id_plato}
                  >
                    {plato.nombre} ·{' '}
                    {plato.tipo_comida}
                  </option>
                ))}
              </select>
            </div>

            {selectedPlato && (
              <div className="inputForm">
                <strong>
                  Información nutricional
                </strong>

                <p>
                  {selectedPlato.calorias} kcal ·
                  Proteínas:{' '}
                  {selectedPlato.proteinas}g ·
                  Carbohidratos:{' '}
                  {selectedPlato.carbohidratos}g ·
                  Grasas: {selectedPlato.grasas}g
                </p>
              </div>
            )}

            <div className="inputForm">
              <label>Observaciones</label>

              <textarea
                rows="3"
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
              />
            </div>

            <button
              className="btn"
              type="submit"
            >
              Registrar consumo
            </button>
          </form>
        </div>

        <div className="generalConsumo">
          <div className="prs">
            <h2>Buscar estudiante</h2>

            <input
              type="text"
              placeholder="Buscar estudiante"
              value={busquedaEstudiante}
              onChange={(e) =>
                setBusquedaEstudiante(
                  e.target.value
                )
              }
            />

            <div
              style={{
                display: 'grid',
                gap: '10px',
                marginTop: '1rem'
              }}
            >
              {estudiantesFiltrados.map(
                (estudiante) => (
                  <button
                    key={
                      estudiante.id_estudiante
                    }
                    className="btn"
                    onClick={() =>
                      buscarConsumo(
                        estudiante.id_estudiante
                      )
                    }
                  >
                    {estudiante.nombre}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="bgr">
            {vistaCarga && (
              <p>Cargando historial...</p>
            )}

            {!vistaCarga &&
              estudianteSeleccionado && (
                <div>
                  <h2>
                    Historial de{' '}
                    {estudianteSeleccionado}
                  </h2>

                  {consumoBusqueda.length === 0 ? (
                    <p>
                      No hay registros.
                    </p>
                  ) : (
                    consumoBusqueda.map(
                      (registro) => (
                        <div
                          key={
                            registro.id_consumo
                          }
                          style={{
                            border:
                              '1px solid #ccc',
                            padding: '1rem',
                            borderRadius:
                              '10px',
                            marginBottom:
                              '1rem'
                          }}
                        >
                          <p>
                            <strong>
                              Fecha:
                            </strong>{' '}
                            {registro.fecha}
                          </p>

                          <p>
                            <strong>
                              Plato:
                            </strong>{' '}
                            {registro.plato
                              ?.nombre ||
                              'Sin plato'}
                          </p>

                          <p>
                            <strong>
                              Observaciones:
                            </strong>{' '}
                            {registro.observaciones ||
                              'Sin observaciones'}
                          </p>

                          {miEstudiante?.id_estudiante ===
                            registro.id_estudiante && (
                            <button
                              className="btn"
                              onClick={() =>
                                eliminarConsumo(
                                  registro.id_consumo,
                                  registro.id_estudiante
                                )
                              }
                            >
                              Eliminar registro
                            </button>
                          )}
                        </div>
                      )
                    )
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};