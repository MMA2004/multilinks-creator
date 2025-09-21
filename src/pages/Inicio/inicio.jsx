import { useNavigate } from "react-router-dom";
import styles from "./Inicio.module.css";

export default function Inicio() {
    const navigate = useNavigate();

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.brand}>
                    <div className={styles.brandLogo} aria-hidden>
                        {/* Pon tu logo aquí si lo tienes */}
                        GM
                    </div>
                    <div>
                        <div className={styles.title}>Gibra Multilinks</div>
                        <div className={styles.subtitle}>
                            Crea, personaliza y comparte tu página de enlaces en minutos.
                        </div>
                    </div>
                </div>

                <div className={styles.metaRow}>
                    <span className={styles.pill}>⚡ Rápido de configurar</span>
                    <span className={styles.pill}>🎨 Personalización total</span>
                    <span className={styles.pill}>📊 Estadísticas integradas</span>
                </div>

                <div className={styles.cta}>
                    <button
                        className={`${styles.btn} ${styles.btnLogin}`}
                        onClick={() => navigate("/login")}
                        type="button"
                    >
                        <span className="bi bi-box-arrow-in-right" aria-hidden />
                        Iniciar sesión
                    </button>

                    <button
                        className={`${styles.btn} ${styles.btnRegister}`}
                        onClick={() => navigate("/registro")}
                        type="button"
                    >
                        <span className="bi bi-person-plus" aria-hidden />
                        Registrarse
                    </button>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>🔗 Tu multilink con subdominio personalizado bajo Gibra.</div>
                    <div className={styles.feature}>🗂️ Formularios personalizables para tus clientes.</div>
                    <div className={styles.feature}>☁️ Hosting rápido y estable en el dominio de Gibra.</div>
                </div>

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
