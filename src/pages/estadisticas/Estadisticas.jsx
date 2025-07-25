import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

function Estadisticas() {
    const { url } = useParams();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`https://api.gibracompany.com/api/stats/${url}.gibracompany.com`);
                if (!response.ok) throw new Error("Error al obtener estadísticas");
                const data = await response.json();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [url]);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>
    );

    if (error) return (
        <div className="alert alert-danger mt-4 text-center">
            {error}
        </div>
    );

    if (!stats) return null;

    const clicksData = Object.entries(stats.clicks_por_boton).map(([boton, clicks]) => ({
        name: boton,
        clicks: clicks,
    }));

    return (
        <div className="container my-5">
            <h2 className="mb-4 text-center">Estadísticas de <span className="text-primary">{stats.subdominio}</span></h2>

            <div className="row mb-5">
                <div className="col-md-6 mb-3">
                    <div className="card shadow-sm text-center">
                        <div className="card-body">
                            <h5 className="card-title">Visitas Totales</h5>
                            <p className="display-5 text-primary">{stats.visitas_totales}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card shadow-sm text-center">
                        <div className="card-body">
                            <h5 className="card-title">Clicks Totales</h5>
                            <p className="display-5 text-success">{stats.clicks_totales}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm mb-5">
                <div className="card-body">
                    <h5 className="card-title mb-4">Clicks por botón</h5>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={clicksData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="clicks" fill="#0d6efd" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Últimas visitas</h5>
                            <ul className="list-group list-group-flush">
                                {stats.ultimas_visitas.map((visita, i) => (
                                    <li key={i} className="list-group-item">
                                        <strong>{new Date(visita.timestamp).toLocaleString()}</strong> — Referrer: <em>{visita.referrer || "Directo"}</em>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <h5 className="card-title">Últimos clicks</h5>
                            <ul className="list-group list-group-flush">
                                {stats.ultimos_clicks.map((click, i) => (
                                    <li key={i} className="list-group-item">
                                        <strong>{new Date(click.timestamp).toLocaleString()}</strong> — Botón: <em>{click.boton}</em>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Estadisticas;

