import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Formulario from "./pages/formulario.jsx";
import AccederMultilink from "./pages/AccederMultilink/AccederMultilink.jsx";
import CrearMultilink from "./pages/crearMultiliks/crearMultilinks.jsx";
import Login from "./pages/login/login.jsx";
import Panel from "./pages/panel/panel.jsx";
import Registro from "./pages/registro/registro.jsx";
import Inicio from "./pages/Inicio/inicio.jsx";
import RegistrarMultilink from "./pages/registrarMultilink/registrarMultilink.jsx";
import MisMultilinks from "./pages/misMultilinks/MisMultilinks.jsx";
import Estadisticas from "./pages/estadisticas/Estadisticas.jsx";
import FormularioCliente from "./pages/formularioClientes/formularioClientes.jsx";
import ResFormulario from "./pages/ResFormulario/ResFormulario.jsx";
import AdminTools from "./pages/tools/tools.jsx";
import EstadisticasGlobales from "./pages/estadisticasGlobales/estadisticasGlobales.jsx";

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
                <Route path="/registrar-multilink" element={<RegistrarMultilink />} />
                <Route path="/mis-multilinks" element={<MisMultilinks />} />
                <Route path="/estadisticas/:url" element={<Estadisticas />} />
                <Route path="/formulario/:id" element={<FormularioCliente />} />
                <Route path="/respuestas/:url" element={<ResFormulario />} />
                <Route path="/admin-tools" element={<AdminTools />} />
                <Route path="/estadisticas-globales" element={<EstadisticasGlobales />} />
            </Routes>
        </Router>
    );
}

export default App;

