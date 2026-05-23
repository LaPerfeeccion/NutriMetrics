import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Home } from './pages/Home';
import { Estadisticas } from './pages/Estadisticas';
import { Consumo } from './pages/Consumo';
import { Registrarse } from './pages/Registrarse';
import { Perfil } from './pages/Perfil';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/consumo" element={<Consumo />} />
        <Route path="/registrarse" element={<Registrarse />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
