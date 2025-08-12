// src/pages/misMultilinks/MisMultilinks.jsx
import { useEffect, useMemo, useState } from "react";
import { db, storage } from "../../services/firebase";
import { collection, query, where, getDocs, doc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdmin } from "../../hooks/useAdmin.js";
import { eliminarCarpetaMultilink } from "../../services/eliminarMultilink.js";
import { extraerPathDesdeURL } from "../../utils/storagePaths.js";
import {getSuspensionStatus, setSuspension} from "../../services/suspension.js";

export default function MisMultilinks() {
    const [multilinks, setMultilinks] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [suspendedMap, setSuspendedMap] = useState({}); // { slug: boolean }
    const [itemLoading, setItemLoading] = useState({});

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
                // Si guardas miembros: array-contains
                const q = query(
                    collection(db, "multilinks"),
                    where("miembros", "array-contains", usuario.uid)
                );
                const snap = await getDocs(q);
                const datos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

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
            alert("Enlace copiado al portapapeles");
        } catch (e) {
            console.error(e);
            alert("No se pudo copiar el enlace");
        }
    };

    const handleToggleSuspend = async (slug) => {
        try {
            const current = !!suspendedMap[slug];
            const next = !current;

            setItemLoading(prev => ({ ...prev, [slug]: true }));
            setSuspendedMap(prev => ({ ...prev, [slug]: next })); // optimista

            await setSuspension(slug, next);

            // revalidación silenciosa
            getSuspensionStatus(slug).then(({ suspended }) => {
                setSuspendedMap(prev => ({ ...prev, [slug]: !!suspended }));
            });
        } catch{
            // revertir si falló
            setSuspendedMap(prev => ({ ...prev, [slug]: !prev[slug] }));
            alert("No se pudo cambiar el estado de suspensión.");
        } finally {
            setItemLoading(prev => ({ ...prev, [slug]: false }));
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
            alert("Solo los administradores pueden eliminar multilinks.");
            return;
        }
        if (!window.confirm(`¿Eliminar "${m.url}" por completo?\nSe borrará la carpeta del servidor, la imagen y el registro en Firebase.`)) return;

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
            alert("Eliminado correctamente.");
        } catch (e) {
            console.error(e);
            alert(`No se pudo eliminar: ${e?.message || e}`);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="misml-root">
            <style>{`
        .misml-root { min-height:100vh; width:100vw; padding:24px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card { width:100%; max-width:1100px; color:#fff; padding:28px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
        .head { display:flex; gap:12px; align-items:center; justify-content:space-between; flex-wrap:wrap; }
        .title { font-size: clamp(22px, 4vw, 30px); font-weight: 800; }
        .search { flex:1; min-width: 220px; }
        .input { width:100%; border-radius:12px; padding: 12px 14px; font-size:14px; color:#0f172a; background: rgba(255,255,255,.95); border:1px solid rgba(15,23,42,.08); outline:none; transition: box-shadow .15s ease, border-color .15s ease; }
        .input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }

        /* Listado vertical */
        .list { display:flex; flex-direction:column; gap:16px; margin-top:18px; }
        .item { position:relative; padding:16px; border-radius:16px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); transition: transform .15s ease, box-shadow .15s ease; }
        .item:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.28); }
        .url { font-weight:800; margin-bottom:6px; word-break: break-word; }
        .meta { font-size: 12px; opacity:.9; }
        .actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
        .btn { appearance:none; border:0; border-radius:12px; padding:10px 12px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
        .btn.alt { background: rgba(255,255,255,.92); color:#111827; }
        .btn.link { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }
        .btn.danger { background:#dc2626; }
        .empty { text-align:center; padding:24px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); border-radius:16px; margin-top:16px; }
        .footer { margin-top:22px; font-size:12px; opacity:.9; }
        .badge { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); font-size:12px; }
        .loading { text-align:center; padding:28px; }
      `}</style>

            <div className="card">
                <div className="head">
                    <button className="btn link" onClick={() => navigate(-1)} style={{ minWidth: "fit-content" }}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className="title">Mis Multilinks</div>
                    <div className="search">
                        <input
                            className="input"
                            placeholder="Buscar por URL o título..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {error && <div className="empty" role="alert">{error}</div>}
                {loading && <div className="loading">Cargando…</div>}

                {!loading && filtrados.length === 0 && !error && (
                    <div className="empty">
                        No tienes multilinks registrados.
                        <div style={{ marginTop: 12 }}>
                            <Link to="/registrar-multilink" style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                                Registrar uno ahora
                            </Link>
                        </div>
                    </div>
                )}

                <div className="list">
                    {filtrados.map((m) => {
                        const slug = String(m.url || "").trim().toLowerCase();
                        const publicUrl = getPublicUrl(slug);
                        const susp = suspendedMap[slug];
                        const isWorking = !!itemLoading[slug];
                        return (
                            <div className="item" key={m.id}>
                                <div className="url">{m.titulo_pagina || m.titulo || m.url}</div>
                                <div className="meta"><span className="badge">{m.url}.gibracompany.com</span></div>
                                <div className="actions">
                                    <button className="btn" onClick={() => navigate(`/editar/${m.id}`)}>
                                        <i className="bi bi-pencil" aria-hidden></i> Editar
                                    </button>
                                    <button className="btn alt" onClick={() => navigate(`/estadisticas/${m.url}`)}>
                                        <i className="bi bi-graph-up" aria-hidden></i> Estadísticas
                                    </button>
                                    <button className="btn link" onClick={() => navigate(`/respuestas/${m.url}`)}>
                                        <i className="bi bi-ui-checks-grid" aria-hidden></i> Respuestas
                                    </button>
                                    <a className="btn link" href={publicUrl} target="_blank" rel="noopener noreferrer">
                                        <i className="bi bi-box-arrow-up-right" aria-hidden></i> Ver página
                                    </a>
                                    <button className="btn link" onClick={() => copy(publicUrl)}>
                                        <i className="bi bi-clipboard" aria-hidden></i> Copiar link
                                    </button>

                                    {/* Solo admin puede eliminar */}
                                    {isAdmin && (
                                        <>
                                        <button
                                            className="btn"
                                            onClick={() => handleToggleSuspend(slug, !susp)}
                                            disabled={isWorking}
                                            title={susp ? "Reactivar multilink" : "Suspender multilink"}
                                        >
                                            <i className={`bi ${susp ? "bi-play-circle" : "bi-pause-circle"}`} aria-hidden></i>
                                            {isWorking
                                                ? (susp ? "Reactivando…" : "Suspendiendo…")
                                                : (susp ? "Reactivar" : "Suspender")}
                                        </button>

                                        <button
                                            className="btn danger"
                                            onClick={() => handleDelete(m)}
                                            disabled={deletingId === m.id}
                                            title="Eliminar del servidor, Storage y Firebase"
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

                <div className="footer">
                    Powered by{" "}
                    <a
                        href="https://www.gibracompany.com/"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#fff', textDecoration: 'underline', textUnderlineOffset: '3px' }}
                    >
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}

