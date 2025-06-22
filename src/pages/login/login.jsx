import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase.js";

function Login() {
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await signInWithEmailAndPassword(auth, correo, clave);
            navigate("/panel");
        } catch (err) {
            console.error(err);
            setError("Correo o contraseña incorrectos");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Iniciar Sesión</h2>
            <form onSubmit={iniciarSesion}>
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
                <button type="submit">Entrar</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;

