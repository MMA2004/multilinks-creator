import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase.js";

function Registro() {
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const registrarUsuario = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await createUserWithEmailAndPassword(auth, correo, clave);
            navigate("/panel");
        } catch (err) {
            console.error(err);
            setError("Error al registrar el usuario");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Registrarse</h2>
            <form onSubmit={registrarUsuario}>
                <input
                    type="email"
                    placeholder="Correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                /><br />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                /><br />
                <button type="submit">Registrarse</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}

export default Registro;
