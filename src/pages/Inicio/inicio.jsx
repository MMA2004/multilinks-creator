import { useNavigate } from "react-router-dom";


function Inicio() {
    const navigate = useNavigate();
    return (
        <>
            <button onClick={() => navigate("/login")}>Iniciar sesión</button>
            <button onClick={() => navigate("/registro")}>Registrarse</button>
        </>
    )

}

export default Inicio;