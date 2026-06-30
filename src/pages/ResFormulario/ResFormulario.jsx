import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAuth } from "../../context/AuthContext.jsx";
import styles from "./ResFormulario.module.css";

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
                
                // Sort by timestamp descending
                data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
    }, [url, usuario]);

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

    if (loading) {
        return <div className={styles.loading}>Cargando respuestas...</div>;
    }

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <div className={styles.headerRow}>
                    <button className={styles.btnBack} onClick={() => navigate("/mis-multilinks")}>
                        <i className="bi bi-arrow-left"></i> Volver a Multilinks
                    </button>
                    <div className={styles.actions}>
                        <input
                            className={styles.searchInput}
                            placeholder="Buscar en respuestas…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className={styles.btnExport} onClick={() => exportarDatos("csv")}>
                            <i className="bi bi-filetype-csv"></i> CSV
                        </button>
                        <button className={styles.btnExport} onClick={() => exportarDatos("excel")}>
                            <i className="bi bi-file-earmark-excel"></i> Excel
                        </button>
                    </div>
                </div>

                <div className={styles.titleArea}>
                    <h1 className={styles.title}>Respuestas de Leads</h1>
                    <span className={styles.pill}>{url}.gibracompany.com</span>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {!error && (
                    <>
                        <div className={styles.kpiGrid}>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiIcon}>
                                    <i className="bi bi-people-fill"></i>
                                </div>
                                <div className={styles.kpiInfo}>
                                    <span className={styles.kpiLabel}>Total Leads</span>
                                    <span className={styles.kpiValue}>{respuestas.length}</span>
                                </div>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiIcon}>
                                    <i className="bi bi-funnel-fill"></i>
                                </div>
                                <div className={styles.kpiInfo}>
                                    <span className={styles.kpiLabel}>Resultados Búsqueda</span>
                                    <span className={styles.kpiValue}>{filtradas.length}</span>
                                </div>
                            </div>
                            <div className={styles.kpiCard}>
                                <div className={styles.kpiIcon}>
                                    <i className="bi bi-clock-history"></i>
                                </div>
                                <div className={styles.kpiInfo}>
                                    <span className={styles.kpiLabel}>Último Lead</span>
                                    <span className={styles.kpiValue} style={{ fontSize: '18px', marginTop: '10px' }}>
                                        {respuestas.length > 0 
                                            ? new Date(respuestas[0].timestamp).toLocaleDateString()
                                            : "N/A"
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {filtradas.length === 0 ? (
                            <div className={styles.tableContainer}>
                                <div className={styles.emptyState}>
                                    <i className={`bi bi-inbox ${styles.emptyIcon}`}></i>
                                    <div>No hay respuestas{search ? " que coincidan con la búsqueda." : " todavía."}</div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.tableContainer}>
                                <div className={styles.tableScroll}>
                                    <table className={styles.table}>
                                        <thead>
                                            <tr>
                                                <th>Fecha de envío</th>
                                                {campos.map((campo) => (
                                                    <th key={campo}>{campo}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtradas.map((respuesta, i) => (
                                                <tr key={i}>
                                                    <td>
                                                        <div className={styles.dateCell}>
                                                            <i className="bi bi-calendar-event"></i>
                                                            {new Date(respuesta.timestamp).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    {campos.map((campo) => (
                                                        <td key={campo}>{String(respuesta.respuestas?.[campo] ?? "—")}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className={styles.footer}>
                            Powered by <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
