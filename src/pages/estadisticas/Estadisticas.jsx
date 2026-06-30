import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import styles from "./Estadisticas.module.css";

export default function Estadisticas() {
    const { url } = useParams();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mesFiltro, setMesFiltro] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const endpoint = `https://api.gibracompany.com/api/stats/${url}.gibracompany.com${mesFiltro ? `?mes=${mesFiltro}` : ''}`;
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
    }, [url, mesFiltro]);

    const clicksData = useMemo(() => {
        if (!stats || !stats.clicks_por_boton) return [];
        return Object.entries(stats.clicks_por_boton)
            .map(([name, clicks]) => ({ name, clicks }))
            .sort((a, b) => b.clicks - a.clicks);
    }, [stats]);

    const referrersData = useMemo(() => {
        if (!stats || !stats.visitas_por_referrer) return [];
        return Object.entries(stats.visitas_por_referrer)
            .map(([name, visits]) => ({ name, visits }))
            .sort((a, b) => b.visits - a.visits);
    }, [stats]);

    const ctr = useMemo(() => {
        if (!stats || !stats.visitas_totales) return 0;
        const calc = (stats.clicks_totales / stats.visitas_totales) * 100;
        return calc > 100 ? 100 : calc.toFixed(1);
    }, [stats]);

    const COLORS = ['#3aabd4', '#0d6efd', '#20c997', '#ffc107', '#fd7e14', '#dc3545', '#6f42c1'];

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.head}>
                    <button className={styles.btn} onClick={() => navigate(-1)} type="button">
                        <i className="bi bi-arrow-left" aria-hidden />
                        <span>Volver</span>
                    </button>

                    <div className={styles.title}>
                        Estadísticas de{" "}
                        <span className={styles.pill}>
              {stats?.subdominio || `${url}.gibracompany.com`}
            </span>
                    </div>

                    <a
                        className={styles.btn}
                        href={`https://${url}.gibracompany.com`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <i className="bi bi-box-arrow-up-right" aria-hidden />
                        <span>Ver página</span>
                    </a>
                </div>

                <div className={styles.infoBar}>
                    <div className={styles.info}>
                        <i className="bi bi-info-circle" aria-hidden></i>
                        <span>{mesFiltro ? `Mostrando datos de ${mesFiltro}` : "Mostrando datos históricos completos."}</span>
                    </div>
                    <div className={styles.filterWrap}>
                        <label>Filtro por Mes:</label>
                        <input 
                            type="month" 
                            className={styles.monthInput}
                            value={mesFiltro}
                            onChange={(e) => setMesFiltro(e.target.value)}
                        />
                    </div>
                </div>

                {loading && <div className={styles.loading}>Cargando…</div>}
                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && stats && (
                    <>
                        <div className={styles.kpis}>
                            <div className={styles.kpi}>
                                <div className={styles.kpiIcon}><i className="bi bi-eye"></i></div>
                                <div>
                                    <h5>Visitas Totales</h5>
                                    <div className={styles.kpiVal}>{stats.visitas_totales ?? 0}</div>
                                </div>
                            </div>
                            <div className={styles.kpi}>
                                <div className={styles.kpiIcon}><i className="bi bi-hand-index-thumb"></i></div>
                                <div>
                                    <h5>Clicks Totales</h5>
                                    <div className={styles.kpiVal}>{stats.clicks_totales ?? 0}</div>
                                </div>
                            </div>
                            <div className={styles.kpi}>
                                <div className={styles.kpiIcon}><i className="bi bi-lightning-charge"></i></div>
                                <div>
                                    <h5>CTR (Conversión)</h5>
                                    <div className={styles.kpiVal}>{ctr}%</div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h5>Desempeño por Botón</h5>
                            {clicksData.length === 0 ? (
                                <div className={styles.empty}>Aún no hay clicks registrados.</div>
                            ) : (
                                <div className={styles.chartsRow}>
                                    <div className={styles.chartWrap}>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={clicksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#666' }} axisLine={false} tickLine={false} />
                                                <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                <Bar dataKey="clicks" fill="#3aabd4" radius={[4, 4, 0, 0]}>
                                                    {clicksData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className={styles.chartWrapPie}>
                                        <ResponsiveContainer width="100%" height={400}>
                                            <PieChart>
                                                <Pie
                                                    data={clicksData}
                                                    cx="50%"
                                                    cy="40%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="clicks"
                                                >
                                                    {clicksData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: '#000' }} />
                                                <Legend 
                                                    verticalAlign="bottom" 
                                                    height={140}
                                                    iconType="circle"
                                                    wrapperStyle={{ 
                                                        maxHeight: '130px', 
                                                        overflowY: 'auto',
                                                        fontSize: '12px',
                                                        scrollbarWidth: 'thin'
                                                    }} 
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={styles.section}>
                            <h5>Fuentes de Tráfico</h5>
                            {referrersData.length === 0 ? (
                                <div className={styles.empty}>Aún no hay datos de referidos.</div>
                            ) : (
                                <div className={styles.referrersList}>
                                    {referrersData.map((ref, i) => (
                                        <div key={i} className={styles.referrerItem}>
                                            <div className={styles.referrerName}>
                                                <i className={`bi ${ref.name === 'Directo' ? 'bi-link' : 'bi-box-arrow-in-right'}`}></i>
                                                {ref.name}
                                            </div>
                                            <div className={styles.referrerCount}>
                                                {ref.visits} visitas
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.lists}>
                            <div className={styles.section}>
                                <h5>Últimas visitas</h5>
                                <div className={styles.list}>
                                    {(stats.ultimas_visitas?.length ? stats.ultimas_visitas : []).map(
                                        (v, i) => (
                                            <div className={styles.row} key={i}>
                                                <strong>{new Date(v.fecha).toLocaleString()}</strong>
                                                <div className={styles.muted}>
                                                    Referrer: <em>{v.referrer || "Directo"}</em>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    {!stats.ultimas_visitas?.length && (
                                        <div className={styles.empty}>Sin visitas recientes.</div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h5>Últimos clicks</h5>
                                <div className={styles.list}>
                                    {(stats.ultimos_clicks?.length ? stats.ultimos_clicks : []).map(
                                        (c, i) => (
                                            <div className={styles.row} key={i}>
                                                <strong>{new Date(c.fecha).toLocaleString()}</strong>
                                                <div className={styles.muted}>
                                                    Botón: <em>{c.boton}</em>
                                                </div>
                                            </div>
                                        )
                                    )}
                                    {!stats.ultimos_clicks?.length && (
                                        <div className={styles.empty}>Sin clicks recientes.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.footer}>
                            Powered by{" "}
                            <a
                                className={styles.link}
                                href="https://www.gibracompany.com/"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Gibra Company
                            </a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


