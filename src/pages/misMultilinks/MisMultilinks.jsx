import { useEffect, useMemo, useState } from "react";
import { db, storage } from "../../services/firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdmin } from "../../hooks/useAdmin.js";
import { eliminarCarpetaMultilink } from "../../services/eliminarMultilink.js";
import { extraerPathDesdeURL } from "../../utils/storagePaths.js";
import { getSuspensionStatus, setSuspension } from "../../services/suspension.js";
import { toast } from "react-hot-toast";
import QRModal from "../../components/qrModal/QRModal.jsx";
import styles from "./MisMultilinks.module.css";

export default function MisMultilinks() {
    const [multilinks, setMultilinks] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [suspendedMap, setSuspendedMap] = useState({}); // { slug: boolean }
    const [itemLoading, setItemLoading] = useState({});
    
    // QR Modal State
    const [showQR, setShowQR] = useState(false);
    const [selectedQR, setSelectedQR] = useState({ url: "", titulo: "" });

    const { usuario } = useAuth();
    const isAdmin = useAdmin();
    const navigate = useNavigate();

    // Cargar multilinks del usuario (o admin)
    useEffect(() => {
        const cargarMultilinks = async () => {
            if (!usuario) return;
            setLoading(true);
            setError("");

            try {
                const qy = query(collection(db, "multilinks"), where("miembros", "array-contains", usuario.uid));
                const snap = await getDocs(qy);
                const datos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setMultilinks(datos);
            } catch (err) {
                console.error(err);
                setError("Error al cargar tus multilinks.");
            } finally {
                setLoading(false);
            }
        };

        cargarMultilinks();
    }, [usuario]);

    // Cargar estado de suspensión para cada slug (solo si admin)
    useEffect(() => {
        if (!isAdmin) return;
        const fetchStatuses = async () => {
            const map = {};
            for (const m of multilinks) {
                const slug = String(m.url || "").trim().toLowerCase();
                if (!slug) continue;
                try {
                    const res = await getSuspensionStatus(slug);
                    map[slug] = !!res?.suspended;
                } catch (e) {
                    console.warn("No se pudo obtener estado de", slug, e);
                }
            }
            setSuspendedMap(map);
        };
        if (multilinks.length) fetchStatuses();
    }, [isAdmin, multilinks]);

    const filtrados = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return multilinks;
        return multilinks.filter((m) =>
            [m.url, m.titulo_pagina, m.titulo]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(s))
        );
    }, [multilinks, search]);

    const getPublicUrl = (u = "") => {
        const trimmed = u.trim();
        if (!trimmed) return "#";
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        if (trimmed.includes(".")) return `https://${trimmed}`;
        return `https://${trimmed}.gibracompany.com`;
    };

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success("Enlace copiado al portapapeles");
        } catch (e) {
            console.error(e);
            toast.error("No se pudo copiar el enlace");
        }
    };

    const handleToggleSuspend = async (slug) => {
        try {
            const current = !!suspendedMap[slug];
            const next = !current;

            setItemLoading((prev) => ({ ...prev, [slug]: true }));
            setSuspendedMap((prev) => ({ ...prev, [slug]: next })); // optimista

            await setSuspension(slug, next);

            // revalidación silenciosa
            getSuspensionStatus(slug).then(({ suspended }) => {
                setSuspendedMap((prev) => ({ ...prev, [slug]: !!suspended }));
            });
        } catch {
            // revertir si falló
            setSuspendedMap((prev) => ({ ...prev, [slug]: !prev[slug] }));
            toast.error("No se pudo cambiar el estado de suspensión.");
        } finally {
            setItemLoading((prev) => ({ ...prev, [slug]: false }));
        }
    };

    async function borrarImagenStorage(urlImagen) {
        if (!urlImagen) return;
        try {
            const path = extraerPathDesdeURL(urlImagen); // p. ej. "imagenes/xxx.jpg"
            if (!path) return;
            await deleteObject(ref(storage, path));
        } catch (e) {
            console.warn("No se pudo borrar la imagen del Storage:", e?.message || e);
            // no rompemos el flujo por esto
        }
    }

    async function handleDelete(m) {
        if (!isAdmin) {
            toast.error("Solo los administradores pueden eliminar multilinks.");
            return;
        }
        if (
            !window.confirm(
                `¿Eliminar "${m.url}" por completo?\nSe borrará la carpeta del servidor, la imagen y el registro en Firebase.`
            )
        )
            return;

        setDeletingId(m.id);
        try {
            // 1) Borrar carpeta en el servidor (solo slug)
            await eliminarCarpetaMultilink(m.url);

            // 2) Borrar imagen del Storage (si existe)
            await borrarImagenStorage(m.imagen);

            // 3) Borrar documento de Firestore
            await deleteDoc(doc(db, "multilinks", m.id));

            // 4) Refrescar UI
            setMultilinks((prev) => prev.filter((x) => x.id !== m.id));
            toast.success("Eliminado correctamente.");
        } catch (e) {
            console.error(e);
            toast.error(`No se pudo eliminar: ${e?.message || e}`);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.head}>
                    <button
                        className={`${styles.btn} `}
                        onClick={() => navigate(-1)}
                        type="button"
                        style={{ minWidth: "fit-content" }}
                    >
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className={styles.title}>Mis Multilinks</div>
                    <div className={styles.search}>
                        <input
                            className={styles.input}
                            placeholder="Buscar por URL o título..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {error && (
                    <div className={styles.empty} role="alert">
                        {error}
                    </div>
                )}
                {loading && <div className={styles.loading}>Cargando…</div>}

                {!loading && filtrados.length === 0 && !error && (
                    <div className={styles.empty}>
                        No tienes multilinks registrados.
                        <div style={{ marginTop: 12 }}>
                            <Link
                                to="/registrar-multilink"
                                style={{
                                    color: "#fff",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px",
                                }}
                            >
                                Registrar uno ahora
                            </Link>
                        </div>
                    </div>
                )}

                <div className={styles.list}>
                    {filtrados.map((m) => {
                        const slug = String(m.url || "").trim().toLowerCase();
                        const publicUrl = getPublicUrl(slug);
                        const susp = suspendedMap[slug];
                        const isWorking = !!itemLoading[slug];
                        return (
                            <div className={styles.item} key={m.id} style={susp ? { opacity: 0.8, borderColor: 'rgba(239, 68, 68, 0.4)' } : {}}>
                                <div>
                                    {susp && (
                                        <div className={styles.suspendedBadge}>
                                            <i className="bi bi-exclamation-triangle"></i> Suspendido
                                        </div>
                                    )}
                                    <div className={styles.url}>{m.titulo_pagina || m.titulo || m.url}</div>
                                    <div className={styles.meta}>
                                        <span className={styles.badge}>{m.url}.gibracompany.com</span>
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button className={styles.btn} onClick={() => navigate(`/editar/${m.id}`)} type="button">
                                        <i className="bi bi-pencil" aria-hidden></i> Editar
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.alt}`}
                                        onClick={() => navigate(`/configurar-leads/${m.id}`)}
                                        type="button"
                                        title="Configurar campos del Formulario"
                                    >
                                        <i className="bi bi-funnel" aria-hidden></i> Leads
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.alt}`}
                                        onClick={() => navigate(`/estadisticas/${m.url}`)}
                                        type="button"
                                    >
                                        <i className="bi bi-graph-up" aria-hidden></i> Estadísticas
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.linkBtn}`}
                                        onClick={() => navigate(`/respuestas/${m.url}`)}
                                        type="button"
                                    >
                                        <i className="bi bi-ui-checks-grid" aria-hidden></i> Respuestas
                                    </button>
                                    <a className={`${styles.btn} ${styles.linkBtn}`} href={publicUrl} target="_blank" rel="noopener noreferrer">
                                        <i className="bi bi-box-arrow-up-right" aria-hidden></i> Página
                                    </a>
                                    <button className={`${styles.btn} ${styles.linkBtn}`} onClick={() => copy(publicUrl)} type="button">
                                        <i className="bi bi-clipboard" aria-hidden></i> Copiar
                                    </button>
                                    <button 
                                        className={`${styles.btn} ${styles.linkBtn}`} 
                                        onClick={() => {
                                            setSelectedQR({ url: publicUrl, titulo: m.titulo_pagina || m.titulo || m.url });
                                            setShowQR(true);
                                        }} 
                                        type="button"
                                        title="Generar Código QR"
                                    >
                                        <i className="bi bi-qr-code" aria-hidden></i> QR
                                    </button>

                                    {isAdmin && (
                                        <>
                                            <button
                                                className={styles.btn}
                                                onClick={() => handleToggleSuspend(slug, !susp)}
                                                disabled={isWorking}
                                                title={susp ? "Reactivar multilink" : "Suspender multilink"}
                                                type="button"
                                            >
                                                <i className={`bi ${susp ? "bi-play-circle" : "bi-pause-circle"}`} aria-hidden></i>
                                                {isWorking ? (susp ? "Reactivando…" : "Suspendiendo…") : susp ? "Reactivar" : "Suspender"}
                                            </button>

                                            <button
                                                className={`${styles.btn} ${styles.danger}`}
                                                onClick={() => handleDelete(m)}
                                                disabled={deletingId === m.id}
                                                title="Eliminar del servidor, Storage y Firebase"
                                                type="button"
                                            >
                                                <i className="bi bi-trash" aria-hidden></i>
                                                {deletingId === m.id ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.footer}>
                    Powered by{" "}
                    <a
                        href="https://www.gibracompany.com/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#fff", textDecoration: "underline", textUnderlineOffset: "3px" }}
                    >
                        Gibra Company
                    </a>
                </div>
            </div>

            <QRModal 
                show={showQR} 
                onHide={() => setShowQR(false)} 
                url={selectedQR.url} 
                titulo={selectedQR.titulo} 
            />
        </div>
    );
}

