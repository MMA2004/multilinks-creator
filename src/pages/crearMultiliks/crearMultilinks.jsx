import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function CrearMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [formularioActivado, setFormularioActivado] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);

    const navigate = useNavigate();
    const esAdmin = useAdmin();
    const { usuario } = useAuth();

    const normalizarUrl = (v) => v.trim().toLowerCase().replace(/\s+/g, "-");
    const slugValido = (v) => /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(v); // 2-63, sin guion al inicio/fin

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        const urlNorm = normalizarUrl(url);
        if (!urlNorm || !clave) {
            setError("Por favor llena todos los campos.");
            return;
        }
        if (!slugValido(urlNorm)) {
            setError("La URL debe ser un slug válido (a–z, 0–9 y guiones, 2–63 caracteres, sin guion al inicio/fin).");
            return;
        }
        if (!usuario?.uid) {
            setError("No hay sesión activa.");
            return;
        }

        try {
            setLoading(true);
            // Verificar si ya existe
            const q = query(collection(db, "multilinks"), where("url", "==", urlNorm));
            const snap = await getDocs(q);
            if (!snap.empty) {
                setError("Ya existe un multilink con esa URL.");
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
                admin_uid: usuario.uid,   // <-- admin creador
                uid: null,                // <-- dueño (cliente) aún no asignado
                miembros: [usuario.uid],
            });

            setSuccess("Multilink creado exitosamente.");
            navigate(`/editar/${docRef.id}`);
        } catch (e) {
            console.error(e);
            setError("Error al crear el multilink.");
        } finally {
            setLoading(false);
        }
    };

    if (!esAdmin) {
        return (
            <div className="cmx-root">
                <style>{styles}</style>
                <div className="cmx-card">
                    <div className="cmx-head">
                        <button className="cmx-btn cmx-link" onClick={() => navigate(-1)}>
                            <i className="bi bi-arrow-left" aria-hidden></i> Volver
                        </button>
                        <div className="cmx-title">Acceso denegado</div>
                        <div />
                    </div>
                    <div className="cmx-error" role="alert">Solo administradores.</div>
                    <div className="cmx-footer">Powered by <a className="cmx-a" href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a></div>
                </div>
            </div>
        );
    }

    return (
        <div className="cmx-root">
            <style>{styles}</style>
            <div className="cmx-card">
                <div className="cmx-head">
                    <button className="cmx-btn cmx-link" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className="cmx-title">Crear nuevo Multilink</div>
                    <div />
                </div>

                {error && <div className="cmx-alert cmx-error" role="alert">{error}</div>}
                {success && <div className="cmx-alert cmx-success" role="status">{success}</div>}

                <form className="cmx-form" onSubmit={handleSubmit}>
                    <div className="cmx-field">
                        <label className="cmx-label" htmlFor="url">URL deseada</label>
                        <div className="cmx-inline">
                            <input
                                id="url"
                                className="cmx-input"
                                placeholder="ej. juan-perez"
                                value={url}
                                onChange={(e) => setUrl(normalizarUrl(e.target.value))}
                                autoComplete="off"
                                required
                            />
                            <span className="cmx-domain">.gibracompany.com</span>
                        </div>
                        <div className="cmx-hint">Será accesible como <span className="cmx-pill">https://{url || "juan-perez"}.gibracompany.com</span></div>
                    </div>

                    <div className="cmx-field cmx-pwd">
                        <label className="cmx-label" htmlFor="clave">Clave de edición</label>
                        <div className="cmx-pwdwrap">
                            <input
                                id="clave"
                                className="cmx-input"
                                type={showPwd ? "text" : "password"}
                                placeholder="Clave secreta"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                required
                            />
                            <button type="button" className="cmx-toggle" onClick={() => setShowPwd((s) => !s)}>
                                {showPwd ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </div>

                    <label className="cmx-check">
                        <input type="checkbox" checked={formularioActivado} onChange={(e) => setFormularioActivado(e.target.checked)} />
                        <span>Activar formulario personalizado</span>
                    </label>

                    <button className="cmx-btn" type="submit" disabled={loading}>
                        {loading ? "Creando…" : "Crear Multilink"}
                    </button>
                </form>

                <div className="cmx-footer">Powered by <a className="cmx-a" href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a></div>
            </div>
        </div>
    );
}

const styles = `
  .cmx-root { min-height:100vh; width:100vw; padding:24px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
  @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  .cmx-card { width:100%; max-width:680px; color:#fff; padding:28px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
  .cmx-head { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:12px; margin-bottom: 10px; }
  .cmx-title { font-size: clamp(20px, 4vw, 26px); font-weight: 800; text-align:center; }
  .cmx-form { display:grid; gap: 14px; }
  .cmx-field { display:grid; gap:8px; }
  .cmx-label { font-size: 12px; opacity:.95; }
  .cmx-input { width:100%; border-radius:12px; padding:12px 14px; font-size:14px; color:#0f172a; background: rgba(255,255,255,.95); border:1px solid rgba(15,23,42,.08); outline:none; transition: box-shadow .15s ease, border-color .15s ease; }
  .cmx-input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }
  .cmx-inline { display:flex; align-items:center; gap:8px; }
  .cmx-domain { padding:10px 12px; border-radius:12px; background: rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.26); }
  .cmx-hint { font-size:12px; opacity:.95; }
  .cmx-pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); }
  .cmx-check { display:flex; align-items:center; gap:10px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); padding:10px 12px; border-radius:12px; }
  .cmx-pwdwrap { position:relative; }
  .cmx-toggle { position:absolute; right:10px; top:0; bottom:0; margin:auto 0; height:100%; display:flex; align-items:center; background:transparent; border:0; cursor:pointer; font-weight:700; color:#0f172a; opacity:.7; }
  .cmx-btn { appearance:none; border:0; border-radius:12px; padding:12px 16px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition: transform .15s ease, box-shadow .15s ease; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
  .cmx-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.3); }
  .cmx-btn.cmx-link { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }
  .cmx-alert { border-radius:12px; padding:10px 12px; font-size:14px; }
  .cmx-error { background: rgba(239,68,68,.18); border: 1px solid rgba(239,68,68,.55); color:#fee2e2; }
  .cmx-success { background: rgba(34,197,94,.18); border: 1px solid rgba(34,197,94,.55); color:#dcfce7; }
  .cmx-footer { margin-top:8px; font-size:12px; opacity:.9; }
  .cmx-a { color:#fff; text-decoration: underline; text-underline-offset: 3px; }
`;
