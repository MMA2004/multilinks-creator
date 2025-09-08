import { useState } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function RegistrarMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { usuario } = useAuth();
    const navigate = useNavigate();

    // ---- Nuevo: estados para CSV ----
    const [csvFile, setCsvFile] = useState(null);
    const [bulkResults, setBulkResults] = useState([]); // [{url, status: 'ok'|'err', message}]
    const [bulkRunning, setBulkRunning] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

    const registerOne = async (urlTrim, claveTrim) => {
        // Retorna {ok: boolean, message: string}
        const q = query(
            collection(db, "multilinks"),
            where("url", "==", urlTrim),
            where("clave_edicion", "==", claveTrim)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            return { ok: false, message: "URL o clave incorrecta." };
        }

        const docSnap = snap.docs[0];
        const data = docSnap.data();

        if (data.uid && data.uid !== usuario.uid) {
            return { ok: false, message: "Este multilink ya está registrado por otro usuario." };
        }

        const docRef = doc(db, "multilinks", docSnap.id);
        await updateDoc(docRef, {
            uid: usuario.uid,
            miembros: arrayUnion(usuario.uid),
        });

        return { ok: true, message: "Registrado." };
    };

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
            const res = await registerOne(urlTrim, claveTrim);
            if (res.ok) {
                setExito("Multilink registrado correctamente.");
                setUrl("");
                setClave("");
            } else {
                setError(res.message);
            }
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al registrar el multilink.");
        } finally {
            setLoading(false);
        }
    };

    // ---- Nuevo: helpers para CSV ----
    const parseCSV = async (file) => {
        const text = await file.text();
        // Detectar separador (, o ;)
        const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) || "";
        const commaCount = (firstLine.match(/,/g) || []).length;
        const semiCount = (firstLine.match(/;/g) || []).length;
        const sep = semiCount > commaCount ? ";" : ",";

        const lines = text
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

        if (lines.length === 0) return [];

        const header = lines[0].split(sep).map((h) => h.trim().toLowerCase());
        const urlIdx = header.indexOf("url");
        const claveIdx = header.indexOf("clave");

        if (urlIdx === -1 || claveIdx === -1) {
            throw new Error("El CSV debe tener encabezados 'url' y 'clave'.");
        }

        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(sep).map((c) => c.trim());
            const urlVal = (cols[urlIdx] || "").trim();
            const claveVal = (cols[claveIdx] || "").trim();
            if (!urlVal) continue; // saltar filas vacías
            rows.push({ url: urlVal, clave: claveVal });
        }
        return rows;
    };

    const handleCSVRun = async () => {
        setError("");
        setExito("");
        setBulkResults([]);
        setBulkProgress({ done: 0, total: 0 });

        if (!usuario) {
            setError("Debes iniciar sesión.");
            return;
        }
        if (!csvFile) {
            setError("Selecciona un archivo CSV.");
            return;
        }

        try {
            setBulkRunning(true);
            const rows = await parseCSV(csvFile);
            if (rows.length === 0) {
                setError("El CSV no tiene filas válidas.");
                setBulkRunning(false);
                return;
            }

            setBulkProgress({ done: 0, total: rows.length });

            const results = [];
            // Procesar en serie para controlar carga y respetar reglas de seguridad/consumo
            for (let i = 0; i < rows.length; i++) {
                const { url, clave } = rows[i];
                const urlTrim = (url || "").trim();
                const claveTrim = (clave || "").trim();

                try {
                    const res = await registerOne(urlTrim, claveTrim);
                    results.push({
                        url: urlTrim,
                        status: res.ok ? "ok" : "err",
                        message: res.message,
                    });
                } catch (err) {
                    console.error(err);
                    results.push({ url: urlTrim, status: "err", message: "Error inesperado." });
                } finally {
                    setBulkProgress((p) => ({ ...p, done: p.done + 1 }));
                }
            }

            setBulkResults(results);

            const oks = results.filter((r) => r.status === "ok").length;
            const errs = results.length - oks;
            if (oks > 0 && errs === 0) {
                setExito(`Registro masivo completado: ${oks} multilink(s).`);
            } else if (oks > 0 && errs > 0) {
                setExito(`Registro masivo parcial: ${oks} ok, ${errs} con error.`);
            } else {
                setError("No se pudo registrar ninguno. Revisa las URL/clave.");
            }
        } catch (e) {
            console.error(e);
            setError(e.message || "No se pudo procesar el CSV.");
        } finally {
            setBulkRunning(false);
        }
    };

    // --- UI estado para drag & drop ---
    const [isDragOver, setIsDragOver] = useState(false);

    const onDropzoneClick = () => {
        document.getElementById("csv-hidden-input")?.click();
    };

    const onDropzoneKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onDropzoneClick();
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const onDragLeave = () => setIsDragOver(false);

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.match(/csv|text\/plain/)) setCsvFile(file);
    };

    const clearCsv = () => setCsvFile(null);

    return (
        <div className="regml-root">
            <style>{`
        .regml-root { 
          min-height: 100vh; width: 100vw; display: grid; place-items: center; padding: 24px; 
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); 
          background-size: 180% 180%; animation: gradientMove 12s ease infinite; box-sizing: border-box; 
        }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card { width: 100%; max-width: 960px; padding: 28px; border-radius: 22px; color: #fff; 
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

        .results { width:100%; overflow-x:auto; border:1px solid rgba(255,255,255,.25); border-radius:12px; }
        table { width:100%; border-collapse: collapse; font-size: 14px; background: rgba(255,255,255,.08); }
        th, td { padding: 10px; border-bottom: 1px solid rgba(255,255,255,.15); text-align:left; }
        th { background: rgba(255,255,255,.12); font-weight:700; }
        .ok { color: #bbf7d0; }
        .err { color: #fecaca; }
        .upload-wrap { display:grid; gap:12px; }
.dropzone {
  position: relative; border: 1.5px dashed rgba(255,255,255,.5);
  background: rgba(255,255,255,.10); border-radius: 16px;
  padding: 22px; display:flex; align-items:center; justify-content:center; 
  text-align:center; cursor:pointer; transition: transform .15s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.dropzone:hover { transform: translateY(-1px); box-shadow: 0 10px 26px rgba(0,0,0,.25); }
.dropzone:focus-visible { outline: 0; box-shadow: 0 0 0 3px rgba(255,255,255,.45); }
.dropzone.dragover { background: rgba(255,255,255,.18); border-color: rgba(255,255,255,.85); }
.dropzone-inner { display:grid; gap:8px; }
.dropzone .title-sm { font-weight:800; letter-spacing:.2px; }
.dropzone .muted { opacity:.9; font-size:13px; }
.badges { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; }
.badge {
  padding:4px 8px; border-radius:999px; font-size:12px;
  background: rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.28);
}
.file-chip {
  display:flex; align-items:center; gap:10px; padding:10px 12px;
  border-radius:12px; background: rgba(255,255,255,.14);
  border:1px solid rgba(255,255,255,.28); font-size:14px;
}
.file-chip .actions { margin-left:auto; display:flex; gap:8px; }
.icon-btn {
  appearance:none; border:0; border-radius:10px; padding:8px 10px; cursor:pointer; 
  background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30);
  color:#fff; transition: transform .15s ease, background .15s ease, border-color .15s ease;
}
.icon-btn:hover { transform: translateY(-1px); }
.progress {
  height:10px; width:100%; border-radius:999px;
  background: rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.25); overflow:hidden;
}
.progress > span {
  display:block; height:100%; width:0%;
  background: linear-gradient(90deg, rgba(99,102,241,.9), rgba(56,189,248,.9), rgba(45,212,191,.9));
  transition: width .25s ease;
}
.hint-sm { font-size:12px; opacity:.9; }
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
                <div className="subtitle">Asocia uno o varios multilinks existentes a tu cuenta mediante la clave de edición.</div>

                {error && <div className="alert alert-error" role="alert">{error}</div>}
                {exito && <div className="alert alert-success" role="status">{exito}</div>}

                {/* Registro individual */}
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
                    
                </form>

                <div className="divider" />

                {/* Registro masivo por CSV */}
                <div>
                    <div className="subtitle" style={{marginBottom:8}}>Registro masivo por CSV</div>
                    <div className="hint" style={{marginBottom:10}}>
                        Sube un archivo con encabezados <span className="pill">url</span> y <span className="pill">clave</span>.
                    </div>

                    <div className="upload-wrap">
                        {/* Dropzone bonita */}
                        <div
                            className={`dropzone ${isDragOver ? "dragover" : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={onDropzoneClick}
                            onKeyDown={onDropzoneKeyDown}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            aria-label="Cargar archivo CSV, clic o arrastra aquí"
                        >
                            <div className="dropzone-inner">
                                <div className="title-sm">
                                    <i className="bi bi-cloud-arrow-up" aria-hidden /> Clic o arrastra tu CSV aquí
                                </div>
                                <div className="muted">Tamaño recomendado &lt; 2MB</div>
                                <div className="badges">
                                    <span className="badge">.csv</span>
                                    <span className="badge">Separador , o ;</span>
                                    <span className="badge">Encabezados url, clave</span>
                                </div>
                            </div>
                            {/* input oculto para abrir el diálogo del sistema */}
                            <input
                                id="csv-hidden-input"
                                type="file"
                                accept=".csv,text/csv"
                                style={{ display: "none" }}
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        {/* Chip con el archivo seleccionado */}
                        {csvFile && (
                            <div className="file-chip" aria-live="polite">
                                <i className="bi bi-filetype-csv" aria-hidden />
                                <div style={{display:'grid', gap:2}}>
                                    <div style={{fontWeight:700}}>{csvFile.name}</div>
                                    <div className="hint-sm">{(csvFile.size/1024).toFixed(1)} KB</div>
                                </div>
                                <div className="actions">
                                    <button type="button" className="icon-btn" onClick={clearCsv} title="Quitar archivo">
                                        <i className="bi bi-x" aria-hidden />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        type="button"
                                        onClick={handleCSVRun}
                                        disabled={bulkRunning}
                                        title="Procesar CSV"
                                    >
                                        {bulkRunning ? <i className="bi bi-hourglass-split" aria-hidden /> : <i className="bi bi-play-fill" aria-hidden />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Barra de progreso */}
                        {bulkRunning && (
                            <div>
                                <div className="progress" aria-label="Progreso de procesamiento">
          <span style={{
              width: `${bulkProgress.total ? Math.round((bulkProgress.done / bulkProgress.total) * 100) : 0}%`
          }} />
                                </div>
                                <div className="hint-sm" style={{marginTop:6}}>
                                    {bulkProgress.done} / {bulkProgress.total} procesados
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabla de resultados */}
                    {bulkResults.length > 0 && (
                        <div className="results" style={{marginTop:12}}>
                            <table>
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>URL</th>
                                    <th>Estado</th>
                                    <th>Detalle</th>
                                </tr>
                                </thead>
                                <tbody>
                                {bulkResults.map((r, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{r.url}</td>
                                        <td className={r.status === "ok" ? "ok" : "err"}>
                                            {r.status === "ok" ? <><i className="bi bi-check-circle" aria-hidden /> OK</> : <><i className="bi bi-exclamation-triangle" aria-hidden /> ERROR</>}
                                        </td>
                                        <td>{r.message}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="footer">
                    Powered by <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{color:'#fff', textDecoration:'underline', textUnderlineOffset:'3px'}}>Gibra Company</a>
                </div>
            </div>
        </div>
    );
}
