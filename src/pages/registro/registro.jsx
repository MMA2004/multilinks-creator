import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../services/firebase.js";
import { toast } from "react-hot-toast";
import styles from "./Registro.module.css";

export default function Registro() {
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const navigate = useNavigate();

    const registrarUsuario = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, correo.trim(), clave);
            toast.success("¡Cuenta creada con éxito!");
            navigate("/panel");
        } catch (err) {
            console.error(err);
            toast.error("Error al registrar el usuario");
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
                        <div className={styles.title}>Crear cuenta</div>
                        <div className={styles.subtitle}>
                            Regístrate para comenzar a usar Gibra Multilinks.
                        </div>
                    </div>
                </div>

                <form onSubmit={registrarUsuario} className={styles.form}>
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
                                autoComplete="new-password"
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
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>

                    <div className={styles.links}>
                        <div className={styles.link}>
                            <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
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

