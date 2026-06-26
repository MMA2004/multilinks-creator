import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../services/firebase.js";
import { toast } from "react-hot-toast";
import styles from "./Login.module.css";

export default function Login() {
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const navigate = useNavigate();

    const iniciarSesion = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, correo.trim(), clave);
            toast.success("¡Bienvenido!");
            navigate("/panel");
        } catch (err) {
            console.error(err);
            toast.error("Correo o contraseña incorrectos");
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
                        <div className={styles.title}>Iniciar sesión</div>
                        <div className={styles.subtitle}>
                            Accede a tu panel para gestionar tus multilinks.
                        </div>
                    </div>
                </div>

                <form onSubmit={iniciarSesion} className={styles.form}>
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

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="password">
                            Contraseña
                        </label>

                        <div className={styles.inputWrap}>
                            <input
                                id="password"
                                className={styles.input}
                                type={showPwd ? "text" : "password"}
                                placeholder="••••••••"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                className={styles.togglePwd}
                                onClick={() => setShowPwd((s) => !s)}
                                aria-label={showPwd ? "Ocultar contraseña" : "Ver contraseña"}
                            >
                                {showPwd ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </div>

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                    <div className={styles.links}>
                        <div className={styles.link}>
                            <Link to="/registro">¿No tienes cuenta? Regístrate</Link>
                        </div>
                        <div className={styles.link}>
                            <Link to="/olvide-clave">¿Olvidaste tu contraseña?</Link>
                        </div>
                        <div className={styles.link}>
                            <Link to="/">Volver al inicio</Link>
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

