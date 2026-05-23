import { supabase } from './supabase';

const STORAGE_KEY = 'nutrimetrics-selected-program';

export const fallbackPrograms = [
  { id: 'pae', nombre: 'PAE' },
  { id: 'alimentacion-escolar', nombre: 'Alimentación Escolar' },
  { id: 'otro-programa', nombre: 'Otro programa' }
];

const normalizeProgram = (program) => ({
  id: String(program.id_programa ?? program.id ?? program.slug ?? program.nombre),
  nombre: program.nombre ?? program.name ?? 'Sin nombre'
});

export const readStoredProgram = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeStoredProgram = (program) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!program) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(program));
};

export const loadPrograms = async () => {
  try {
    const { data, error } = await supabase
      .from('programa')
      .select('id_programa, nombre')
      .order('nombre', { ascending: true });

    if (error || !Array.isArray(data) || data.length === 0) {
      return fallbackPrograms;
    }

    return data.map(normalizeProgram);
  } catch {
    return fallbackPrograms;
  }
};

export const getProgramLabel = (program) => program?.nombre || 'Selecciona un programa';
