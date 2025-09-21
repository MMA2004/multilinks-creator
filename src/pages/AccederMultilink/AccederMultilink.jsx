import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import styles from "./AccederMultilink.module.css";

export default function AccederMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const navigate = useNavigate();

    const normalizarUrl = (v) => v.trim().toLowerCase().replace(/\s+/g, "-");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const slug = normalizarUrl(url);
        try {
            const qy = query(
                collection(db, "multilinks"),
                where("url", "==", slug),
                where("clave_edicion", "==", clave)
            );
            const snap = await getDocs(qy);

            if (!snap.empty) {
                const docId = snap.docs[0].id;
                navigate(`/editar/${docId}`);
            } else {
                setError("URL o clave incorrecta.");
            }
        } catch (e) {
            console.error(e);
            setError("Error buscando el multilink.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.head}>
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.link}`}
                        onClick={() => navigate(-1)}
                    >
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className={styles.title}>Editar tu Multilink</div>
                    <div />
                </div>

                {error && (
                    <div className={`${styles.alert} ${styles.error}`} role="alert">
                        {error}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="url">
                            URL de tu multilink
                        </label>
                        <div className={styles.inline}>
                            <input
                                id="url"
                                className={styles.input}
                                placeholder="ej. juan-perez"
                                value={url}
                                onChange={(e) => setUrl(normalizarUrl(e.target.value))}
                                autoComplete="off"
                                required
                            />
                            <span className={styles.domain}>.gibracompany.com</span>
                        </div>
                        <div className={styles.hint}>
                            Ejemplo completo:{" "}
                            <span className={styles.pill}>
                https://{url || "juan-perez"}.gibracompany.com
              </span>
                        </div>
                    </div>

                    <div className={`${styles.field} ${styles.pwd}`}>
                        <label className={styles.label} htmlFor="clave">
                            Clave de edición
                        </label>
                        <div className={styles.pwdwrap}>
                            <input
                                id="clave"
                                className={styles.input}
                                type={showPwd ? "text" : "password"}
                                placeholder="Tu clave secreta"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={styles.toggle}
                                onClick={() => setShowPwd((s) => !s)}
                                aria-label={showPwd ? "Ocultar clave" : "Ver clave"}
                            >
                                {showPwd ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </div>

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? "Accediendo…" : "Acceder"}
                    </button>

                    <div className={styles.footer}>
                        Powered by{" "}
                        <a
                            className={styles.a}
                            href="https://www.gibracompany.com/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Gibra Company
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

