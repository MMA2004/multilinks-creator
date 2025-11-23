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
} from "recharts";
import styles from "./Estadisticas.module.css";

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
        return Object.entries(stats.clicks_por_boton).map(([name, clicks]) => ({
            name,
            clicks,
        }));
    }, [stats]);

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

                <div className={styles.info}>
                    <i className="bi bi-info-circle" aria-hidden></i>
                    <span>Mostrando datos de los últimos 90 días.</span>
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
                                <h5>Visitas Totales</h5>
                                <div className={styles.kpiVal}>{stats.visitas_totales ?? 0}</div>
                            </div>
                            <div className={styles.kpi}>
                                <h5>Clicks Totales</h5>
                                <div className={styles.kpiVal}>{stats.clicks_totales ?? 0}</div>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <h5>Clicks por botón</h5>
                            {clicksData.length === 0 ? (
                                <div className={styles.empty}>Aún no hay clicks registrados.</div>
                            ) : (
                                <div className={styles.chartWrap}>
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


