// src/pages/EstadisticasGlobales.jsx
import { useEffect, useMemo, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function EstadisticasGlobales() {
    const { usuario } = useAuth();
    const [multilinks, setMultilinks] = useState([]); // {id, url, ...}
    const [rows, setRows] = useState([]);             // filas consolidadas por multilink
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // --- helper para llamar tu API por subdominio ---
    const fetchStatsBySubdomain = async (subdominio, signal) => {
        const endpoint = `https://api.gibracompany.com/api/stats/${subdominio}`;
        const res = await fetch(endpoint, { signal });
        if (!res.ok) throw new Error(`Error API stats: ${subdominio}`);
        return res.json();
    };

    // 1) Cargar multilinks del usuario
    useEffect(() => {
        const load = async () => {
            if (!usuario) return;
            try {
                const q = query(collection(db, "multilinks"), where("uid", "==", usuario.uid));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setMultilinks(data);
            } catch (e) {
                console.error(e);
                setError("Error cargando multilinks.");
            }
        };
        load();
    }, [usuario]);

    // 2) Por cada multilink, traer stats desde tu API y armar filas
    useEffect(() => {
        const controller = new AbortController();
        const loadStats = async () => {
            if (!multilinks.length) { setRows([]); setLoading(false); return; }
            setLoading(true);
            setError("");

            try {
                const settled = await Promise.allSettled(
                    multilinks.map(async (m) => {
                        const subdominio = `${m.url}.gibracompany.com`;
                        const data = await fetchStatsBySubdomain(subdominio, controller.signal);
                        return {
                            url: subdominio,
                            visitas: data?.visitas_totales ?? 0,
                            clicksTotales: data?.clicks_totales ?? 0,
                            clicksPorBoton: data?.clicks_por_boton ?? {},
                            // opcionalmente conserva crudos que te sirvan
                            raw: data || null,
                        };
                    })
                );

                const resultados = settled
                    .map((res, i) => {
                        const subdominio = `${multilinks[i].url}.gibracompany.com`;
                        if (res.status === "fulfilled") return res.value;
                        // si falló ese subdominio, igual lo ponemos con 0s
                        console.warn(`Fallo stats para ${subdominio}:`, res.reason);
                        return { url: subdominio, visitas: 0, clicksTotales: 0, clicksPorBoton: {}, raw: null };
                    });

                setRows(resultados);
            } catch (e) {
                if (e.name !== "AbortError") {
                    console.error(e);
                    setError("Error cargando estadísticas.");
                }
            } finally {
                setLoading(false);
            }
        };

        loadStats();
        return () => controller.abort();
    }, [multilinks]);

    // 3) Totales globales
    const totales = useMemo(() => {
        return rows.reduce(
            (acc, r) => {
                acc.visitas += r.visitas;
                acc.clicks += r.clicksTotales;
                return acc;
            },
            { visitas: 0, clicks: 0 }
        );
    }, [rows]);

    // 4) Exportación CSV/Excel (columnas dinámicas por botón)
    const exportar = (formato) => {
        if (!rows.length) return;

        const setBotones = new Set();
        rows.forEach(r => Object.keys(r.clicksPorBoton || {}).forEach(k => setBotones.add(k)));
        const botones = Array.from(setBotones).sort();

        const datos = rows.map(r => {
            const base = {
                URL: r.url,
                "Visitas totales": r.visitas,
                "Clicks totales": r.clicksTotales
            };
            botones.forEach(b => {
                base[`Clicks ${b}`] = r.clicksPorBoton?.[b] ?? 0;
            });
            return base;
        });

        // Agrega fila de totales al final (opcional)
        const totalRow = {
            URL: "TOTAL",
            "Visitas totales": totales.visitas,
            "Clicks totales": totales.clicks
        };
        botones.forEach(b => {
            totalRow[`Clicks ${b}`] = rows.reduce((acc, r) => acc + (r.clicksPorBoton?.[b] ?? 0), 0);
        });
        datos.push(totalRow);

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Global");

        const nombre = `estadisticas_globales.${formato === "excel" ? "xlsx" : "csv"}`;
        if (formato === "excel") {
            XLSX.writeFile(libro, nombre);
        } else {
            XLSX.writeFile(libro, nombre, { bookType: "csv" });
        }
    };

    // --- columnas dinámicas para la tabla en pantalla ---
    const allButtons = useMemo(() => {
        const s = new Set();
        rows.forEach(r => Object.keys(r.clicksPorBoton || {}).forEach(k => s.add(k)));
        return Array.from(s).sort();
    }, [rows]);

    return (
        <div className="stats-root">
            <style>{`
        .stats-root { min-height:100vh; width:100vw; display:flex; align-items:center; justify-content:center; padding:24px; box-sizing:border-box; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card { width:100%; max-width:1200px; color:#fff; padding:28px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
        .title { font-size: clamp(22px, 4vw, 30px); font-weight: 800; text-align:center; margin-bottom: 8px; }
        .controls { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom: 12px; }
        .btn { appearance:none; border:0; border-radius:12px; padding:10px 12px; font-weight:700; background: rgba(255,255,255,.18); color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; border:1px solid rgba(255,255,255,.30); }
        .pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); font-size:12px; }
        .kpis { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:14px; margin: 12px 0 18px; }
        .kpi { text-align:center; border-radius:16px; padding:16px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); }
        .kpi h5 { margin:0 0 6px; font-weight:800; }
        .kpi .val { font-size: clamp(28px, 6vw, 40px); font-weight:800; }
        .error { text-align:center; padding:12px; border-radius:12px; background: rgba(239,68,68,.18); border:1px solid rgba(239,68,68,.55); color:#fee2e2; margin-bottom:12px; }
        .table-wrap { overflow:auto; border-radius:12px; border:1px solid rgba(255,255,255,.20); }
        table { width:100%; border-collapse: collapse; }
        th, td { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.15); }
        th { text-align:left; background: rgba(255,255,255,.08); position:sticky; top:0; backdrop-filter: blur(6px); }
        tr:last-child td { border-bottom: 0; }
        .muted { opacity:.9; }
        .section { border-radius:16px; padding:16px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); margin-top:16px; }
        .empty { text-align:center; padding:16px; opacity:.9; }
        .loading { text-align:center; padding:28px; }
        a.link { color:#fff; text-decoration: underline; text-underline-offset: 3px; }
        .head { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:12px; margin-bottom:8px; }
.title { margin:0; } /* ya existe, esto asegura que no agregue espacio extra */
      `}</style>

            <div className="card">
                <div className="head">
                    <button className="btn" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                </div>
                <div className="title">Estadísticas globales</div>

                {error && <div className="error" role="alert">{error}</div>}

                <div className="kpis">
                    <div className="kpi">
                        <h5>Visitas Totales</h5>
                        <div className="val">{totales.visitas}</div>
                    </div>
                    <div className="kpi">
                        <h5>Clicks Totales</h5>
                        <div className="val">{totales.clicks}</div>
                    </div>
                </div>

                <div className="controls">
                    <button className="btn" onClick={() => exportar("csv")}>Descargar CSV</button>
                    <button className="btn" onClick={() => exportar("excel")}>Descargar Excel</button>
                </div>

                {loading ? (
                    <div className="loading">Cargando…</div>
                ) : rows.length === 0 ? (
                    <div className="empty">No hay datos.</div>
                ) : (
                    <>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                <tr>
                                    <th>URL</th>
                                    <th>Visitas</th>
                                    <th>Clicks totales</th>
                                    {allButtons.map(b => <th key={`h-${b}`}>Clicks {b}</th>)}
                                    <th>Abrir</th>
                                    <th>Ver detalle</th>
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((r) => (
                                    <tr key={r.url}>
                                        <td>{r.url}</td>
                                        <td>{r.visitas}</td>
                                        <td>{r.clicksTotales}</td>
                                        {allButtons.map(b => (
                                            <td key={`${r.url}-${b}`}>{r.clicksPorBoton?.[b] ?? 0}</td>
                                        ))}
                                        <td>
                                            <a className="link" href={`https://${r.url}`} target="_blank" rel="noreferrer">
                                                Página
                                            </a>
                                        </td>
                                        <td>
                                            {/* Asumiendo tu ruta individual es /estadisticas/:url */}
                                            <a className="link" href={`/estadisticas/${r.url.replace(".gibracompany.com", "")}`}>
                                                Detalle
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Detalle opcional por botones */}
                        {rows.some(r => Object.keys(r.clicksPorBoton || {}).length) && (
                            <div className="section">
                                <h5>Detalle de clicks por botón</h5>
                                {rows.map(r => (
                                    <div key={`detalle-${r.url}`} style={{ marginBottom: 12 }}>
                                        <strong>{r.url}</strong>
                                        {Object.keys(r.clicksPorBoton || {}).length === 0 ? (
                                            <div className="muted">Sin clicks por botón.</div>
                                        ) : (
                                            <ul style={{ marginTop: 6 }}>
                                                {Object.entries(r.clicksPorBoton).map(([boton, cant]) => (
                                                    <li key={boton}>{boton}: {cant}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

