import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Formulario from "./pages/Formulario/formulario.jsx";
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
import OlvideClave from "./pages/OlvideClave/OlvideClave.jsx";
import ConfigurarLeads from "./pages/configurarLeads/ConfigurarLeads.jsx";
import ConfigurarValoraciones from "./pages/configurarValoraciones/ConfigurarValoraciones.jsx";
import ValoracionCliente from "./pages/valoracionCliente/ValoracionCliente.jsx";
import ResValoraciones from "./pages/ResValoraciones/ResValoraciones.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Toaster } from "react-hot-toast";

function App() {
    return (
        <Router>
            <Toaster position="top-right" />
            <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/olvide-clave" element={<OlvideClave />} />

                {/* Rutas Protegidas */}
                <Route path="/panel" element={<ProtectedRoute><Panel /></ProtectedRoute>} />
                <Route path="/editar/:id" element={<ProtectedRoute><Formulario /></ProtectedRoute>} />
                <Route path="/configurar-leads/:id" element={<ProtectedRoute><ConfigurarLeads /></ProtectedRoute>} />
                <Route path="/configurar-valoraciones/:id" element={<ProtectedRoute><ConfigurarValoraciones /></ProtectedRoute>} />
                <Route path="/crear-multilink" element={<ProtectedRoute><CrearMultilink /></ProtectedRoute>} />
                <Route path="/registrar-multilink" element={<ProtectedRoute><RegistrarMultilink /></ProtectedRoute>} />
                <Route path="/mis-multilinks" element={<ProtectedRoute><MisMultilinks /></ProtectedRoute>} />
                <Route path="/estadisticas/:url" element={<ProtectedRoute><Estadisticas /></ProtectedRoute>} />
                <Route path="/estadisticas-globales" element={<ProtectedRoute><EstadisticasGlobales /></ProtectedRoute>} />
                <Route path="/admin-tools" element={<ProtectedRoute><AdminTools /></ProtectedRoute>} />

                {/* Rutas Públicas (acceso por clave o enlace) */}
                <Route path="/acceder" element={<AccederMultilink />} />
                <Route path="/formulario/:id" element={<FormularioCliente />} />
                <Route path="/valoracion/:id" element={<ValoracionCliente />} />
                <Route path="/respuestas/:url" element={<ProtectedRoute><ResFormulario /></ProtectedRoute>} />
                <Route path="/respuestas-valoraciones/:url" element={<ProtectedRoute><ResValoraciones /></ProtectedRoute>} />
            </Routes>
        </Router>
    );
}

export default App;

