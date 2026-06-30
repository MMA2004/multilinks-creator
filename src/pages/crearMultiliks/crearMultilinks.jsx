import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-hot-toast";
import styles from "./crearMultilink.module.css";

export default function CrearMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [formularioActivado, setFormularioActivado] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [maxMiembros, setMaxMiembros] = useState(1);

    const navigate = useNavigate();
    const esAdmin = useAdmin();
    const { usuario } = useAuth();

    const normalizarUrl = (v) => v.trim().toLowerCase().replace(/\s+/g, "-");
    // 2–63, letras/números/guiones, sin guion al inicio/fin:
    const slugValido = (v) => /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(v);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const urlNorm = normalizarUrl(url);
        if (!urlNorm || !clave) {
            toast.error("Por favor llena todos los campos.");
            return;
        }
        if (!slugValido(urlNorm)) {
            toast.error("La URL debe ser un slug válido (a–z, 0–9 y guiones, 2–63 caracteres, sin guion al inicio/fin).");
            return;
        }
        if (!usuario?.uid) {
            toast.error("No hay sesión activa.");
            return;
        }

        try {
            setLoading(true);
            // Existe ya?
            const qy = query(collection(db, "multilinks"), where("url", "==", urlNorm));
            const snap = await getDocs(qy);
            if (!snap.empty) {
                toast.error("Ya existe un multilink con esa URL.");
                return;
            }

            const plantilla = {
                titulo_pagina: "Ejemplo",
                plantilla: "plantilla_comercial",
                titulo: "Título",
                subtitulo: "Subtítulo",
                telefono: "0000000000",
                correo: "correo",
                fondo: "#ffffff",
                imagen: "",
                tamano_foto: "120px",
                color_titulo: "#000000",
                tamano_titulo: "24px",
                mt_titulo: "20px",
                mb_titulo: "10px",
                color_subtitulo: "#000000",
                tamano_subtitulo: "18px",
                mt_subtitulo: "5px",
                mb_subtitulo: "15px",
                color_footer: "#000000",
                mostrar_boton_contacto: true,
                contacto_bg: "#000000",
                contacto_color: "#ffffff",
                contacto_glassmorphism: false,
                nombre: "",
                nota: "",
                formulario_activado: formularioActivado,
                formulario_campos: [],
                botones: [
                    {
                        url: "",
                        texto: "Botón",
                        icono: "",
                        bg_color: "#000000",
                        text_color: "#ffffff",
                        icon_color: "#ffffff",
                    },
                ],
            };

            const docRef = await addDoc(collection(db, "multilinks"), {
                ...plantilla,
                url: urlNorm,
                clave_edicion: clave,
                creado_en: new Date(),
                admin_uid: usuario.uid,

                // ✅ nuevo
                max_miembros: Number(maxMiembros) || 1,
                uid_principal: null,
                miembros: [usuario.uid],
            });

            toast.success("Multilink creado exitosamente.");
            navigate(`/editar/${docRef.id}`);
        } catch (e) {
            console.error(e);
            toast.error("Error al crear el multilink.");
        } finally {
            setLoading(false);
        }
    };

    if (!esAdmin) {
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
                        <div className={styles.title}>Acceso denegado</div>
                        <div />
                    </div>
                    <div className={styles.errorOnly} role="alert">
                        Solo administradores.
                    </div>
                    <div className={styles.footer}>
                        Powered by{" "}
                        <a
                            className={styles.anchor}
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
                    <div className={styles.title}>Crear nuevo Multilink</div>
                    <div />
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="url">
                            URL deseada
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
                            Será accesible como{" "}
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
                                placeholder="Clave secreta"
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

                    <div className={styles.field}>
                        <label className={styles.label} htmlFor="maxMiembros">
                            ¿Cuántas cuentas pueden registrarlo?
                        </label>

                        <input
                            id="maxMiembros"
                            className={styles.input}
                            type="number"
                            min={1}
                            max={10}
                            value={maxMiembros}
                            onChange={(e) => setMaxMiembros(Math.max(1, Number(e.target.value || 1)))}
                        />

                        <div className={styles.hint}>
                            Ej: 1 = solo una cuenta, 2 = dos cuentas pueden registrarlo, etc.
                        </div>
                    </div>

                    <label className={styles.check}>
                        <input
                            type="checkbox"
                            checked={formularioActivado}
                            onChange={(e) => setFormularioActivado(e.target.checked)}
                        />
                        <span>Activar formulario personalizado</span>
                    </label>

                    <button className={styles.btn} type="submit" disabled={loading}>
                        {loading ? "Creando…" : "Crear Multilink"}
                    </button>
                </form>

                <div className={styles.footer}>
                    Powered by{" "}
                    <a
                        className={styles.anchor}
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
