import { useState } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";
import {Link, useNavigate} from "react-router-dom";
import { arrayUnion } from "firebase/firestore";

export default function RegistrarMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setExito("");

        if (!usuario) {
            setError("Debes iniciar sesión.");
            return;
        }

        const urlTrim = url.trim();
        const claveTrim = clave.trim();

        if (!urlTrim) {
            setError("Ingresa la URL del multilink.");
            return;
        }

        setLoading(true);
        try {
            const q = query(
                collection(db, "multilinks"),
                where("url", "==", urlTrim),
                where("clave_edicion", "==", claveTrim)
            );

            const snap = await getDocs(q);

            if (!snap.empty) {
                const docSnap = snap.docs[0];
                const data = docSnap.data();

                if (data.uid) {
                    setError("Este multilink ya está registrado por otro usuario.");
                } else {
                    const docRef = doc(db, "multilinks", docSnap.id);
                    await updateDoc(docRef, {
                        uid: usuario.uid,                 // dueño/registrante
                        miembros: arrayUnion(usuario.uid) // <-- lo agrega a miembros
                    });
                    setExito("Multilink registrado correctamente.");
                    setUrl("");
                    setClave("");
                }
            } else {
                setError("URL o clave incorrecta.");
            }
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al registrar el multilink.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="regml-root">
            <style>{`
        .regml-root { 
          min-height: 100vh; width: 100vw; display: grid; place-items: center; padding: 24px; 
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); 
          background-size: 180% 180%; animation: gradientMove 12s ease infinite; box-sizing: border-box; 
        }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card { width: 100%; max-width: 720px; padding: 28px; border-radius: 22px; color: #fff; 
          background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 18px 50px rgba(0,0,0,.25); 
        }
        .title { font-size: clamp(22px, 4vw, 30px); font-weight: 800; margin-bottom: 6px; }
        .subtitle { opacity: .95; margin-bottom: 18px; }

        form { display: grid; gap: 14px; }
        .row { display: grid; gap: 14px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .row{ grid-template-columns: 1.2fr 0.8fr; } }

        .field { display: grid; gap: 8px; }
        .label { font-size: 12px; opacity: .9; }
        .input { width: 100%; border-radius: 12px; padding: 12px 14px; font-size: 14px; color: #0f172a; background: rgba(255,255,255,.95); border: 1px solid rgba(15, 23, 42, .08); outline: none; transition: box-shadow .15s ease, border-color .15s ease; }
        .input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }

        .input-wrap { position: relative; }
        .toggle-pwd { position: absolute; right: 10px; top: 0; bottom: 0; margin: auto 0; height: 100%; display:flex; align-items:center; background:transparent; border:0; cursor:pointer; font-weight:700; color:#0f172a; opacity:.7; }

        .hint { font-size: 12px; opacity: .9; }
        .pill { padding:6px 10px; border-radius: 999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); font-size: 12px; }
        .divider { height:1px; background: rgba(255,255,255,.2); margin: 6px 0 12px; }

        .btn { appearance:none; border:0; border-radius:12px; padding:12px 16px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.3); }
        .btn[disabled] { opacity:.6; cursor:not-allowed; box-shadow:none; transform:none; }
        .btn.link { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }

        .alert { border-radius: 12px; padding: 10px 12px; font-size: 14px; }
        .alert-error { background: rgba(239,68,68,.18); border: 1px solid rgba(239,68,68,.55); color:#fee2e2; }
        .alert-success { background: rgba(34,197,94,.18); border: 1px solid rgba(34,197,94,.55); color:#dcfce7; }
        .footer { margin-top: 16px; opacity: .9; font-size: 12px; }
        .input-wrap { position: relative; }
      `}</style>

            <div className="card">
                <button
                    className="btn link"
                    onClick={() => navigate(-1)}
                    style={{ minWidth: "fit-content", marginBottom: "12px" }}
                >
                    <i className="bi bi-arrow-left" aria-hidden></i> Volver
                </button>
                <div className="title">Registrar Multilink</div>
                <div className="subtitle">Asocia un multilink existente a tu cuenta mediante la clave de edición.</div>

                {error && <div className="alert alert-error" role="alert">{error}</div>}
                {exito && <div className="alert alert-success" role="status">{exito}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="field">
                            <label className="label" htmlFor="url">URL del multilink</label>
                            <input
                                id="url"
                                className="input"
                                placeholder="ej. juanperez"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className="field">
                            <label className="label" htmlFor="clave">Clave de edición</label>
                            <div className="input-wrap">
                                <input
                                    id="clave"
                                    className="input"
                                    type={showPwd ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                                <button type="button" className="toggle-pwd" onClick={() => setShowPwd(s => !s)}>
                                    {showPwd ? "Ocultar" : "Ver"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className="btn" type="submit" disabled={loading}>
                        <i className="bi bi-bookmark-plus" aria-hidden></i>
                        {loading ? "Registrando..." : "Registrar"}
                    </button>

                    <div className="divider" />
                    <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                        <Link to="/mis-multilinks" style={{color:'#fff', textDecoration:'underline', textUnderlineOffset: '3px'}}>Ver mis Multilinks</Link>
                    </div>
                </form>

                <div className="footer">Powered by <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{color:'#fff', textDecoration:'underline', textUnderlineOffset:'3px'}}>Gibra Company</a></div>
            </div>
        </div>
    );
}
