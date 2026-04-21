// src/pages/EstadisticasGlobales/EstadisticasGlobales.jsx
import { useEffect, useMemo, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useNavigate } from "react-router-dom";
import styles from "./EstadisticasGlobales.module.css";

export default function EstadisticasGlobales() {
    const { usuario } = useAuth();
    const isAdmin = useAdmin();
    const [multilinks, setMultilinks] = useState([]); // {id, url, ...}
    const [rows, setRows] = useState([]);             // filas consolidadas por multilink
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [mes, setMes] = useState("");
    const [searchUrl, setSearchUrl] = useState("");
    const [selectedUrls, setSelectedUrls] = useState([]);

    const navigate = useNavigate();

    // --- helper para llamar tu API por subdominio ---
    const fetchStatsBySubdomain = async (subdominio, mesFiltro, signal) => {
        let endpoint = `https://api.gibracompany.com/api/stats/${subdominio}`;
        if (mesFiltro) {
            endpoint += `?mes=${mesFiltro}`;
        }
        const res = await fetch(endpoint, { signal });
        if (!res.ok) throw new Error(`Error API stats: ${subdominio}`);
        return res.json();
    };

    // 1) Cargar multilinks del usuario
    useEffect(() => {
        const load = async () => {
            if (!usuario) return;
            try {
                let qy;
                if (isAdmin) {
                    qy = query(collection(db, "multilinks"));
                } else {
                    qy = query(collection(db, "multilinks"), where("uid", "==", usuario.uid));
                }
                const snap = await getDocs(qy);
                const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setMultilinks(data);
                setSelectedUrls(data.map((m) => `${m.url}.gibracompany.com`));
            } catch (e) {
                console.error(e);
                setError("Error cargando multilinks.");
            }
        };
        load();
    }, [usuario, isAdmin]);

    // 2) Por cada multilink, traer stats desde tu API y armar filas
    useEffect(() => {
        const controller = new AbortController();
        const loadStats = async () => {
            if (!multilinks.length) {
                setRows([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError("");

            try {
                const settled = await Promise.allSettled(
                    multilinks.map(async (m) => {
                        const subdominio = `${m.url}.gibracompany.com`;
                        const data = await fetchStatsBySubdomain(subdominio, mes, controller.signal);
                        return {
                            url: subdominio,
                            visitas: data?.visitas_totales ?? 0,
                            clicksTotales: data?.clicks_totales ?? 0,
                            clicksPorBoton: data?.clicks_por_boton ?? {},
                            raw: data || null,
                        };
                    })
                );

                const resultados = settled.map((res, i) => {
                    const subdominio = `${multilinks[i].url}.gibracompany.com`;
                    if (res.status === "fulfilled") return res.value;
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
    }, [multilinks, mes]);

    // 3) Totales globales
    const totales = useMemo(() => {
        return rows.filter((r) => selectedUrls.includes(r.url)).reduce(
            (acc, r) => {
                acc.visitas += r.visitas;
                acc.clicks += r.clicksTotales;
                return acc;
            },
            { visitas: 0, clicks: 0 }
        );
    }, [rows, selectedUrls]);

    // 4) Exportación CSV/Excel (columnas dinámicas por botón)
    const exportar = (formato) => {
        const rowsToExport = rows.filter((r) => selectedUrls.includes(r.url));
        if (!rowsToExport.length) return;

        const setBotones = new Set();
        rowsToExport.forEach((r) => Object.keys(r.clicksPorBoton || {}).forEach((k) => setBotones.add(k)));
        const botones = Array.from(setBotones).sort();

        const datos = rowsToExport.map((r) => {
            const base = {
                URL: r.url,
                "Visitas totales": r.visitas,
                "Clicks totales": r.clicksTotales,
            };
            botones.forEach((b) => {
                base[`Clicks ${b}`] = r.clicksPorBoton?.[b] ?? 0;
            });
            return base;
        });

        // Fila de totales (opcional)
        const totalRow = {
            URL: "TOTAL",
            "Visitas totales": totales.visitas,
            "Clicks totales": totales.clicks,
        };
        botones.forEach((b) => {
            totalRow[`Clicks ${b}`] = rowsToExport.reduce((acc, r) => acc + (r.clicksPorBoton?.[b] ?? 0), 0);
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
    const filteredRows = useMemo(() => {
        return rows.filter((r) => r.url.toLowerCase().includes(searchUrl.toLowerCase()));
    }, [rows, searchUrl]);

    const allButtons = useMemo(() => {
        const s = new Set();
        filteredRows.forEach((r) => Object.keys(r.clicksPorBoton || {}).forEach((k) => s.add(k)));
        return Array.from(s).sort();
    }, [filteredRows]);

    const handleToggleAll = (e) => {
        if (e.target.checked) {
            setSelectedUrls(filteredRows.map(r => r.url));
        } else {
            setSelectedUrls([]);
        }
    };

    const handleTogglePage = (url) => {
        setSelectedUrls((prev) => 
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.head}>
                    <button className={styles.btn} onClick={() => navigate(-1)} type="button" style={{ minWidth: "fit-content", marginBottom: 12 }} >
                        <i className="bi bi-arrow-left" aria-hidden></i> Volver
                    </button>
                </div>

                <h2 className={styles.title}>Estadísticas globales</h2>

                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                <div className={styles.kpis}>
                    <div className={styles.kpi}>
                        <h5>Visitas Totales</h5>
                        <div className={styles.kpiVal}>{totales.visitas}</div>
                    </div>
                    <div className={styles.kpi}>
                        <h5>Clicks Totales</h5>
                        <div className={styles.kpiVal}>{totales.clicks}</div>
                    </div>
                </div>

                <div className={styles.controls} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="searchUrlFilter" style={{ fontWeight: 600 }}>URL:</label>
                        <input
                            id="searchUrlFilter"
                            type="text"
                            placeholder="Buscar URL..."
                            value={searchUrl}
                            onChange={(e) => setSearchUrl(e.target.value)}
                            style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc", minWidth: "150px" }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label htmlFor="mesFilter" style={{ fontWeight: 600 }}>Mes:</label>
                        <input
                            id="mesFilter"
                            type="month"
                            value={mes}
                            onChange={(e) => setMes(e.target.value)}
                            style={{ padding: "6px", borderRadius: "5px", border: "1px solid #ccc" }}
                        />
                    </div>
                    <button className={styles.btn} onClick={() => exportar("csv")} type="button">
                        Descargar CSV
                    </button>
                    <button className={styles.btn} onClick={() => exportar("excel")} type="button">
                        Descargar Excel
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loading}>Cargando…</div>
                ) : rows.length === 0 ? (
                    <div className={styles.empty}>No hay datos en general.</div>
                ) : filteredRows.length === 0 ? (
                    <div className={styles.empty}>No hay resultados para esta búsqueda.</div>
                ) : (
                    <>
                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            onChange={handleToggleAll}
                                            checked={selectedUrls.length === filteredRows.length && filteredRows.length > 0}
                                        />
                                    </th>
                                    <th>URL</th>
                                    <th>Visitas</th>
                                    <th>Clicks totales</th>
                                    {allButtons.map((b) => (
                                        <th key={`h-${b}`}>Clicks {b}</th>
                                    ))}
                                    <th>Abrir</th>
                                    <th>Ver detalle</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredRows.map((r) => (
                                    <tr key={r.url}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedUrls.includes(r.url)}
                                                onChange={() => handleTogglePage(r.url)}
                                            />
                                        </td>
                                        <td>{r.url}</td>
                                        <td>{r.visitas}</td>
                                        <td>{r.clicksTotales}</td>
                                        {allButtons.map((b) => (
                                            <td key={`${r.url}-${b}`}>{r.clicksPorBoton?.[b] ?? 0}</td>
                                        ))}
                                        <td>
                                            <a
                                                className={styles.link}
                                                href={`https://${r.url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Página
                                            </a>
                                        </td>
                                        <td>
                                            {/* Asumiendo tu ruta individual es /estadisticas/:url */}
                                            <a
                                                className={styles.link}
                                                href={`/estadisticas/${r.url.replace(".gibracompany.com", "")}`}
                                            >
                                                Detalle
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {filteredRows.some((r) => Object.keys(r.clicksPorBoton || {}).length) && (
                            <div className={styles.section}>
                                <h5>Detalle de clicks por botón</h5>
                                {filteredRows.map((r) => (
                                    <div key={`detalle-${r.url}`} style={{ marginBottom: 12 }}>
                                        <strong>{r.url}</strong>
                                        {Object.keys(r.clicksPorBoton || {}).length === 0 ? (
                                            <div className={styles.muted}>Sin clicks por botón.</div>
                                        ) : (
                                            <ul style={{ marginTop: 6 }}>
                                                {Object.entries(r.clicksPorBoton).map(([boton, cant]) => (
                                                    <li key={boton}>
                                                        {boton}: {cant}
                                                    </li>
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

