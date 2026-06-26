import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ResFormulario() {
    const { url } = useParams();
    const navigate = useNavigate();
    const { usuario } = useAuth();

    const [respuestas, setRespuestas] = useState([]);
    const [campos, setCampos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const cargarRespuestas = async () => {
            setLoading(true);
            setError("");
            try {
                const isAdmin = usuario?.email === "gibra.company@gmail.com";
                let q;
                
                if (isAdmin) {
                    q = query(collection(db, "respuestas_formulario"), where("multilink_url", "==", url));
                } else {
                    q = query(
                        collection(db, "respuestas_formulario"), 
                        where("multilink_url", "==", url),
                        where("miembros", "array-contains", usuario.uid)
                    );
                }

                const snap = await getDocs(q);
                const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                setRespuestas(data);

                const todosLosCampos = new Set();
                data.forEach((r) => {
                    Object.keys(r.respuestas || {}).forEach((campo) => todosLosCampos.add(campo));
                });
                setCampos(Array.from(todosLosCampos));
            } catch (e) {
                setError(e.message || "Error inesperado");
            } finally {
                setLoading(false);
            }
        };

        cargarRespuestas();
    }, [url]);

    const filtradas = useMemo(() => {
        const s = search.trim().toLowerCase();
        if (!s) return respuestas;
        return respuestas.filter((r) => {
            const base = [new Date(r.timestamp).toLocaleString()].concat(
                Object.values(r.respuestas || {}).map((v) => String(v))
            ).join(" ").toLowerCase();
            return base.includes(s);
        });
    }, [respuestas, search]);

    const exportarDatos = (formato) => {
        const dataSrc = filtradas.length ? filtradas : respuestas;
        if (!dataSrc.length) return;

        const datos = dataSrc.map((r) => {
            const fila = {};
            campos.forEach((campo) => {
                fila[campo] = r.respuestas?.[campo] ?? "";
            });
            fila["Fecha de envío"] = new Date(r.timestamp).toLocaleString();
            return fila;
        });

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Respuestas");

        const nombreArchivo = `respuestas_${url}.${formato === "excel" ? "xlsx" : "csv"}`;
        if (formato === "excel") {
            XLSX.writeFile(libro, nombreArchivo);
        } else {
            XLSX.writeFile(libro, nombreArchivo, { bookType: "csv" });
        }
    };

    return (
        <div className="rfx-root">
            <style>{styles}</style>
            <div className="rfx-card">
                <div className="rfx-top-bar">
                    <button className="rfx-btn rfx-link" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className="rfx-actions">
                        <input
                            className="rfx-input"
                            placeholder="Buscar en respuestas…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="rfx-btn" onClick={() => exportarDatos("csv")}>
                            <i className="bi bi-filetype-csv" aria-hidden></i> CSV
                        </button>
                        <button className="rfx-btn" onClick={() => exportarDatos("excel")}>
                            <i className="bi bi-file-earmark-excel" aria-hidden></i> Excel
                        </button>
                    </div>
                </div>

                <div className="rfx-title-container">
                    <h1 className="rfx-title">Respuestas del formulario</h1>
                    <span className="rfx-pill">{url}.gibracompany.com</span>
                </div>

                {loading && <div className="rfx-loading">Cargando…</div>}
                {error && <div className="rfx-error" role="alert">{error}</div>}

                {!loading && !error && (
                    <>
                        {filtradas.length === 0 ? (
                            <div className="rfx-empty">No hay respuestas{search ? " que coincidan con la búsqueda" : ""}.</div>
                        ) : (
                            <div className="rfx-tablewrap">
                                <table className="rfx-table">
                                    <thead>
                                    <tr>
                                        {campos.map((campo) => (
                                            <th key={campo}>{campo}</th>
                                        ))}
                                        <th>Fecha de envío</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filtradas.map((respuesta, i) => (
                                        <tr key={i}>
                                            {campos.map((campo) => (
                                                <td key={campo}>{String(respuesta.respuestas?.[campo] ?? "")}</td>
                                            ))}
                                            <td>{new Date(respuesta.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="rfx-footer">
                            Powered by <a className="rfx-link-a" href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

const styles = `
  .rfx-root { min-height:100vh; width:100vw; padding:24px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background-color: #010101; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 20px 20px; font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow-x: hidden; }
  .rfx-card { width:100%; max-width:1200px; color:#ffffff; padding:24px; border-radius:20px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.35); }
  
  .rfx-top-bar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; margin-bottom: 24px; }
  .rfx-actions { display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  
  .rfx-title-container { display:flex; flex-direction:column; align-items:center; gap:12px; margin-bottom:32px; text-align:center; }
  .rfx-title { font-size: clamp(24px, 4vw, 32px); font-weight: 800; color:#ffffff; letter-spacing:-0.5px; margin:0; }
  .rfx-pill { display:inline-block; padding:8px 16px; border-radius:999px; background: rgba(58,172,214,.15); border:1px solid #3aacd6; font-size:14px; font-weight:600; color:#ffffff; max-width:100%; word-break:break-all; }

  .rfx-input { flex:1; min-width: 200px; border-radius:12px; padding:10px 14px; font-size:15px; color:#010101; background: rgba(255,255,255,.98); border:1px solid rgba(15,23,42,.10); outline:none; transition: box-shadow .15s ease, border-color .15s ease, background .15s ease; }
  .rfx-input:focus { border-color: #3aacd6; box-shadow: 0 0 0 4px rgba(58,172,214,.25); background: #ffffff; }
  .rfx-btn { appearance:none; border:1px solid #3aacd6; border-radius:12px; padding:10px 14px; font-size:15px; font-weight:700; background: #010101; color:#ffffff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:8px; box-shadow: 0 10px 22px rgba(0,0,0,.35); transition: transform .15s ease, box-shadow .15s ease, background .15s ease, color .15s ease; }
  .rfx-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.45); background: #3aacd6; color: #010101; border-color: #3aacd6; }
  .rfx-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }
  .rfx-btn.rfx-link { background: rgba(58,172,214,.15); border: 1px solid #3aacd6; color:#ffffff; }
  .rfx-btn.rfx-link:hover { background: #3aacd6; color:#010101; }

  .rfx-loading { text-align:center; padding:28px; color:#ffffff; }
  .rfx-error { text-align:center; padding:16px; border-radius:12px; background: rgba(239,68,68,.2); border:1px solid rgba(239,68,68,.4); color:#fee2e2; margin-top: 10px; font-weight:500; }
  .rfx-empty { text-align:center; padding:24px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); border-radius:16px; color:#ffffff; }

  .rfx-tablewrap { width:100%; overflow:auto; border-radius:16px; border:1px solid rgba(255,255,255,.20); background: rgba(255,255,255,.05); margin-top: 16px; }
  .rfx-table { width:100%; border-collapse: collapse; }
  .rfx-table th, .rfx-table td { padding: 16px; border-bottom: 1px solid rgba(255,255,255,.1); color:#ffffff; font-size: 15px; }
  .rfx-table thead th { position: sticky; top: 0; background: rgba(1,1,1,.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); text-align:left; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: rgba(255,255,255,0.85); border-bottom: 1px solid rgba(255,255,255,.20); }
  .rfx-table tbody tr { transition: transform .15s ease, background .15s ease; }
  .rfx-table tbody tr:hover { background: rgba(58,172,214,.15); }
  .rfx-table tbody tr:last-child td { border-bottom: none; }
  
  .rfx-footer { margin-top: 22px; font-size:12px; color:#ffffff; opacity:.9; text-align:center; }
  .rfx-link-a { color:#ffffff; text-decoration: underline; text-underline-offset: 3px; font-weight:600; }
`;
