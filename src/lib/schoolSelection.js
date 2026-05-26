const STORAGE_KEY = 'nutrimetrics-selected-school';

export const readStoredSchool = () => {
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

export const writeStoredSchool = (school) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!school) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      id: school.id_colegio ?? school.id ?? null,
      nombre: school.nombre ?? school.name ?? ''
    })
  );
};

export const clearStoredSchool = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};
