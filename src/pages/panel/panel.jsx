import { useNavigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import {useAdmin} from "../../hooks/useAdmin.js";


function Panel() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const isAdmin = useAdmin();

    if (!usuario) return null;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Bienvenido, {usuario.email}</h2>

            {isAdmin && (
                <>
                    <button onClick={() => navigate("/crear-multilink")}>Crear multilink</button>
                    <button onClick={() => navigate("/acceder")}>Editar multilink</button>
                </>
            )}

            {!isAdmin && (
                <button onClick={() => navigate("/acceder")}>Editar multilink</button>
            )}
        </div>
    );
}

export default Panel;
