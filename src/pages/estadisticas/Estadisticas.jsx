import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function Estadisticas() {
    const { url } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const endpoint = `https://api.gibracompany.com/api/stats/${url}.gibracompany.com`;
                const res = await fetch(endpoint, { signal: controller.signal });
                if (!res.ok) throw new Error("Error al obtener estadísticas");
                const data = await res.json();
                setStats(data);
            } catch (err) {
                if (err.name !== "AbortError") setError(err.message || "Error inesperado");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        return () => controller.abort();
    }, [url]);

    const clicksData = useMemo(() => {
        if (!stats || !stats.clicks_por_boton) return [];
        return Object.entries(stats.clicks_por_boton).map(([name, clicks]) => ({ name, clicks }));
    }, [stats]);

    return (
        <div className="stats-root">
            <style>{`
        .stats-root { min-height:100vh; width:100vw; display:flex; align-items:center; justify-content:center; padding:24px; box-sizing:border-box; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card { width:100%; max-width:1200px; color:#fff; padding:28px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 20px 60px rgba(0,0,0,.25); }
        .head { display:grid; grid-template-columns: auto 1fr auto; align-items:center; gap:12px; margin-bottom: 12px; }
        .btn { appearance:none; border:0; border-radius:12px; padding:10px 12px; font-weight:700; background: rgba(255,255,255,.18); color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; border:1px solid rgba(255,255,255,.30); }
        .title { font-size: clamp(22px, 4vw, 30px); font-weight: 800; text-align:center; }
        .pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); font-size:12px; }
        .kpis { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap:14px; margin: 12px 0 18px; }
        .kpi { text-align:center; border-radius:16px; padding:16px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); }
        .kpi h5 { margin:0 0 6px; font-weight:800; }
        .kpi .val { font-size: clamp(28px, 6vw, 40px); font-weight:800; }
        .section { border-radius:16px; padding:16px; background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20); margin-bottom:16px; }
        .section h5 { margin:0 0 10px; font-weight:800; }
        .lists { display:grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 992px) { .lists { grid-template-columns: 1fr 1fr; } }
        .list { border-radius:12px; overflow:hidden; background: rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.16); }
        .row { padding:10px 12px; border-bottom:1px solid rgba(255,255,255,.12); }
        .row:last-child { border-bottom:0; }
        .muted { opacity:.9; }
        .footer { margin-top: 8px; font-size:12px; opacity:.9; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
        .link { color:#fff; text-decoration: underline; text-underline-offset: 3px; }
        .empty { text-align:center; padding:16px; opacity:.9; }
        .loading { text-align:center; padding:28px; }
        .error { text-align:center; padding:12px; border-radius:12px; background: rgba(239,68,68,.18); border:1px solid rgba(239,68,68,.55); color:#fee2e2; margin-bottom:12px; }
      `}</style>

            <div className="card">
                <div className="head">
                    <button className="btn" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                    <div className="title">Estadísticas de <span className="pill">{stats?.subdominio || `${url}.gibracompany.com`}</span></div>
                    <a className="btn" href={`https://${url}.gibracompany.com`} target="_blank" rel="noreferrer">
                        <i className="bi bi-box-arrow-up-right" aria-hidden></i> Ver página
                    </a>
                </div>

                {loading && <div className="loading">Cargando…</div>}
                {error && <div className="error" role="alert">{error}</div>}
                {!loading && !error && stats && (
                    <>
                        <div className="kpis">
                            <div className="kpi">
                                <h5>Visitas Totales</h5>
                                <div className="val">{stats.visitas_totales ?? 0}</div>
                            </div>
                            <div className="kpi">
                                <h5>Clicks Totales</h5>
                                <div className="val">{stats.clicks_totales ?? 0}</div>
                            </div>
                        </div>

                        <div className="section">
                            <h5>Clicks por botón</h5>
                            {clicksData.length === 0 ? (
                                <div className="empty">Aún no hay clicks registrados.</div>
                            ) : (
                                <div style={{ width: '100%', height: 320 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={clicksData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="clicks" fill="#0d6efd" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>

                        <div className="lists">
                            <div className="section">
                                <h5>Últimas visitas</h5>
                                <div className="list">
                                    {(stats.ultimas_visitas?.length ? stats.ultimas_visitas : []).map((v, i) => (
                                        <div className="row" key={i}>
                                            <strong>{new Date(v.timestamp).toLocaleString()}</strong>
                                            <div className="muted">Referrer: <em>{v.referrer || "Directo"}</em></div>
                                        </div>
                                    ))}
                                    {!stats.ultimas_visitas?.length && <div className="empty">Sin visitas recientes.</div>}
                                </div>
                            </div>

                            <div className="section">
                                <h5>Últimos clicks</h5>
                                <div className="list">
                                    {(stats.ultimos_clicks?.length ? stats.ultimos_clicks : []).map((c, i) => (
                                        <div className="row" key={i}>
                                            <strong>{new Date(c.timestamp).toLocaleString()}</strong>
                                            <div className="muted">Botón: <em>{c.boton}</em></div>
                                        </div>
                                    ))}
                                    {!stats.ultimos_clicks?.length && <div className="empty">Sin clicks recientes.</div>}
                                </div>
                            </div>
                        </div>

                        <div className="footer">
                            Powered by <a className="link" href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


