import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdmin } from "../../hooks/useAdmin.js";
import styles from "./panel.module.css";

export default function Panel() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const isAdmin = useAdmin();

    if (!usuario) return null;

    const accionesAdmin = [
        {
            title: "Crear multilink",
            desc: "Genera un multilink desde cero para un cliente.",
            icon: "bi-magic",
            onClick: () => navigate("/crear-multilink"),
        },
        {
            title: "Ver mis Multilinks",
            desc: "Lista, edita y consulta estadísticas.",
            icon: "bi-collection",
            onClick: () => navigate("/mis-multilinks"),
        },
        {
            title: "Estadísticas globales",
            desc: "Consolida visitas y clicks de todos tus multilinks.",
            icon: "bi-graph-up-arrow",
            onClick: () => navigate("/estadisticas-globales"),
        },
    ];

    const accionesUsuario = [
        {
            title: "Registrar Multilink",
            desc: "Asocia tu multilink a tu cuenta con una clave.",
            icon: "bi-bookmark-plus",
            onClick: () => navigate("/registrar-multilink"),
        },
        {
            title: "Ver mis Multilinks",
            desc: "Lista, edita y consulta estadísticas.",
            icon: "bi-collection",
            onClick: () => navigate("/mis-multilinks"),
        },
        {
            title: "Estadísticas globales",
            desc: "Consolida visitas y clicks de todos tus multilinks.",
            icon: "bi-graph-up-arrow",
            onClick: () => navigate("/estadisticas-globales"),
        },
    ];

    const acciones = isAdmin ? accionesAdmin : accionesUsuario;

    return (
        <div className={styles.panelRoot}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.hello}>
                        <div className={styles.badge}>GM</div>
                        <div>
                            <h1 className={styles.title}>
                                Bienvenido{usuario?.email ? ", " : ""}
                                {usuario?.email}
                            </h1>
                            <div className={styles.role}>
                                Rol: {isAdmin ? "Administrador" : "Usuario"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.grid}>
                    {acciones.map((a) => (
                        <button
                            key={a.title}
                            className={styles.action}
                            onClick={a.onClick}
                            aria-label={a.title}
                        >
                            <i className={`bi ${a.icon} ${styles.icon}`} aria-hidden></i>
                            <div className={styles.actTitle}>{a.title}</div>
                            <div className={styles.actDesc}>{a.desc}</div>
                        </button>
                    ))}
                </div>

                <div className={styles.footer}>
                    Powered by{" "}
                    <a
                        className={styles.footerLink}
                        href="https://www.gibracompany.com/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}

