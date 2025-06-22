import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Formulario from "./pages/formulario.jsx";
import AccederMultilink from "./pages/AccederMultilink/AccederMultilink.jsx";
import CrearMultilink from "./pages/crearMultiliks/crearMultilinks.jsx";
import Login from "./pages/login/login.jsx";
import Panel from "./pages/panel/panel.jsx";
import Registro from "./pages/registro/registro.jsx";
import Inicio from "./pages/Inicio/inicio.jsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/panel" element={<Panel />} />
                <Route path="/editar/:id" element={<Formulario />} />
                <Route path="/acceder" element={<AccederMultilink />} />
                <Route path="/crear-multilink" element={<CrearMultilink />} />
            </Routes>
        </Router>
    );
}

export default App;

