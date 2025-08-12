import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function ResFormulario() {
    const { url } = useParams();
    const navigate = useNavigate();

    const [respuestas, setRespuestas] = useState([]);
    const [campos, setCampos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const cargarRespuestas = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`https://api.gibracompany.com/api/ver-formularios/${url}.gibracompany.com`, { signal: controller.signal });
                if (!res.ok) throw new Error("Error cargando respuestas");
                const data = await res.json();
                setRespuestas(Array.isArray(data) ? data : []);

                const todosLosCampos = new Set();
                (Array.isArray(data) ? data : []).forEach((r) => {
                    Object.keys(r.respuestas || {}).forEach((campo) => todosLosCampos.add(campo));
                });
                setCampos(Array.from(todosLosCampos));
            } catch (e) {
                if (e.name !== "AbortError") setError(e.message || "Error inesperado");
            } finally {
                setLoading(false);
            }
        };

        cargarRespuestas();
        return () => controller.abort();
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
                <div className="rfx-head">
                    <button className="rfx-btn rfx-link" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className="rfx-title">Respuestas del formulario <span className="rfx-pill">{url}.gibracompany.com</span></div>
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
  .rfx-root { min-height:100vh; width:100vw; padding:24px; box-sizing:border-box; display:flex; align-items:center; justify-content:center; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
  @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  .rfx-card { width:100%; max-width:1200px; color:#fff; padding:28px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
  .rfx-head { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:12px; margin-bottom: 10px; }
  .rfx-title { font-size: clamp(20px, 4vw, 26px); font-weight: 800; text-align:center; }
  .rfx-actions { display:flex; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
  .rfx-input { width: 220px; border-radius:12px; padding:10px 12px; font-size:14px; color:#0f172a; background: rgba(255,255,255,.95); border:1px solid rgba(15,23,42,.08); outline:none; }
  .rfx-input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }
  .rfx-btn { appearance:none; border:0; border-radius:12px; padding:10px 12px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
  .rfx-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.3); }
  .rfx-btn.rfx-link { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }
  .rfx-pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); font-size:12px; margin-left:8px; }

  .rfx-loading { text-align:center; padding:28px; }
  .rfx-error { text-align:center; padding:12px; border-radius:12px; background: rgba(239,68,68,.18); border:1px solid rgba(239,68,68,.55); color:#fee2e2; margin-top: 10px; }
  .rfx-empty { text-align:center; padding:16px; opacity:.9; background: rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.18); border-radius:12px; }

  .rfx-tablewrap { width:100%; overflow:auto; border-radius:12px; border:1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.04); }
  .rfx-table { width:100%; border-collapse: collapse; }
  .rfx-table th, .rfx-table td { padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,.12); color:#fff; }
  .rfx-table thead th { position: sticky; top: 0; background: rgba(0,0,0,.25); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); text-align:left; }
  .rfx-footer { margin-top: 12px; font-size:12px; opacity:.9; }
  .rfx-link-a { color:#fff; text-decoration: underline; text-underline-offset: 3px; }
`;
