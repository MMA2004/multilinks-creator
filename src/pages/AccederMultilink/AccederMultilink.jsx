import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase.js";

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
            const q = query(
                collection(db, "multilinks"),
                where("url", "==", slug),
                where("clave_edicion", "==", clave)
            );
            const snap = await getDocs(q);

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
        <div className="amx-root">
            <style>{styles}</style>
            <div className="amx-card">
                <div className="amx-head">
                    <button className="amx-btn amx-link" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className="amx-title">Editar tu Multilink</div>
                    <div />
                </div>

                {error && (
                    <div className="amx-alert amx-error" role="alert">{error}</div>
                )}

                <form className="amx-form" onSubmit={handleSubmit}>
                    <div className="amx-field">
                        <label className="amx-label" htmlFor="url">URL de tu multilink</label>
                        <div className="amx-inline">
                            <input
                                id="url"
                                className="amx-input"
                                placeholder="ej. juan-perez"
                                value={url}
                                onChange={(e) => setUrl(normalizarUrl(e.target.value))}
                                autoComplete="off"
                                required
                            />
                            <span className="amx-domain">.gibracompany.com</span>
                        </div>
                        <div className="amx-hint">Ejemplo completo: <span className="amx-pill">https://{url || "juan-perez"}.gibracompany.com</span></div>
                    </div>

                    <div className="amx-field amx-pwd">
                        <label className="amx-label" htmlFor="clave">Clave de edición</label>
                        <div className="amx-pwdwrap">
                            <input
                                id="clave"
                                className="amx-input"
                                type={showPwd ? "text" : "password"}
                                placeholder="Tu clave secreta"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                required
                            />
                            <button type="button" className="amx-toggle" onClick={() => setShowPwd((s) => !s)}>
                                {showPwd ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </div>

                    <button className="amx-btn" type="submit" disabled={loading}>
                        {loading ? "Accediendo…" : "Acceder"}
                    </button>

                    <div className="amx-footer">
                        Powered by <a className="amx-a" href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = `
  .amx-root { min-height:100vh; width:100vw; padding:24px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
  @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  .amx-card { width:100%; max-width:680px; color:#fff; padding:28px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
  .amx-head { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:12px; margin-bottom: 10px; }
  .amx-title { font-size: clamp(20px, 4vw, 26px); font-weight: 800; text-align:center; }
  .amx-form { display:grid; gap: 14px; }
  .amx-field { display:grid; gap:8px; }
  .amx-label { font-size: 12px; opacity:.95; }
  .amx-input { width:100%; border-radius:12px; padding:12px 14px; font-size:14px; color:#0f172a; background: rgba(255,255,255,.95); border:1px solid rgba(15,23,42,.08); outline:none; transition: box-shadow .15s ease, border-color .15s ease; }
  .amx-input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }
  .amx-inline { display:flex; align-items:center; gap:8px; }
  .amx-domain { padding:10px 12px; border-radius:12px; background: rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.26); }
  .amx-hint { font-size:12px; opacity:.95; }
  .amx-pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); }
  .amx-pwdwrap { position:relative; }
  .amx-toggle { position:absolute; right:10px; top:0; bottom:0; margin:auto 0; height:100%; display:flex; align-items:center; background:transparent; border:0; cursor:pointer; font-weight:700; color:#0f172a; opacity:.7; }
  .amx-btn { appearance:none; border:0; border-radius:12px; padding:12px 16px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition: transform .15s ease, box-shadow .15s ease; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
  .amx-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.3); }
  .amx-btn.amx-link { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }
  .amx-alert { border-radius:12px; padding:10px 12px; font-size:14px; }
  .amx-error { background: rgba(239,68,68,.18); border: 1px solid rgba(239,68,68,.55); color:#fee2e2; }
  .amx-footer { margin-top:8px; font-size:12px; opacity:.9; }
  .amx-a { color:#fff; text-decoration: underline; text-underline-offset: 3px; }
`;
