import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadPrograms, readStoredProgram, writeStoredProgram } from '../lib/programSelection';

const ProgramContext = createContext({
  programs: [],
  selectedProgram: null,
  isReady: false,
  selectProgram: () => {},
  loadingPrograms: true
});

export const ProgramProvider = ({ children }) => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  useEffect(() => {
    const init = async () => {
      const loadedPrograms = await loadPrograms();
      setPrograms(loadedPrograms);

      const storedProgram = readStoredProgram();
      const current = loadedPrograms.find((program) => program.id === storedProgram?.id) || null;

      setSelectedProgram(current);
      writeStoredProgram(current);
      setLoadingPrograms(false);
    };

    init();
  }, []);

  const selectProgram = (program) => {
    setSelectedProgram(program || null);
    writeStoredProgram(program || null);
  };

  const value = useMemo(() => ({
    programs,
    selectedProgram,
    isReady: !loadingPrograms,
    selectProgram,
    loadingPrograms
  }), [programs, selectedProgram, loadingPrograms]);

  return (
    <ProgramContext.Provider value={value}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgram = () => useContext(ProgramContext);
