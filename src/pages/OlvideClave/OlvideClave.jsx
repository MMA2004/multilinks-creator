import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../../services/firebase.js";
import styles from "../login/Login.module.css"; // reutilizamos el mismo CSS

export default function OlvideClave() {
    const [correo, setCorreo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const recuperarClave = async (e) => {
        e.preventDefault();
        setError("");
        setMensaje("");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, correo.trim());
            setMensaje("Te hemos enviado un correo para restablecer tu contraseña. Recuerda revisar tu bandeja de SPAM.");
        } catch (err) {
            console.error("Error al enviar correo de recuperación:", err);
            if (err.code === "auth/user-not-found") {
                setError("No existe una cuenta registrada con este correo.");
            } else if (err.code === "auth/invalid-email") {
                setError("El correo electrónico ingresado no es válido.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Has realizado demasiados intentos. Por favor, espera un momento y vuelve a intentarlo.");
            } else {
                setError("Hubo un problema al enviar el correo. Por favor, intenta nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.brand}>
                    <div className={styles.brandBadge}>GM</div>
                    <div>
                        <div className={styles.title}>Recuperar contraseña</div>
                        <div className={styles.subtitle}>
                            Ingresa tu correo y te enviaremos un enlace de recuperación.
                        </div>
                    </div>
                </div>

                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                {mensaje && (
                    <div className={styles.error} style={{borderColor:"rgba(34,197,94,.55)", background:"rgba(34,197,94,.18)", color:"#bbf7d0"}}>
                        {mensaje}
                    </div>
                )}

                <form onSubmit={recuperarClave} className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">
                            Correo
                        </label>
                        <input
                            id="email"
                            className={styles.input}
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar enlace"}
                    </button>

                    <div className={styles.links}>
                        <div className={styles.link}>
                            <Link to="/login">Volver a iniciar sesión</Link>
                        </div>
                    </div>
                </form>

                <div className={styles.footer}>
                    Powered by{" "}
                    <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}
