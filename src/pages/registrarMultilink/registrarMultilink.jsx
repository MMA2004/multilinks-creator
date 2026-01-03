import { useState } from "react";
import { db } from "../../services/firebase";
import {
    collection, query, where, getDocs, doc
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import styles from "./RegistrarMultilink.module.css";
import { runTransaction } from "firebase/firestore";

export default function RegistrarMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { usuario } = useAuth();
    const navigate = useNavigate();

    // ---- CSV state ----
    const [csvFile, setCsvFile] = useState(null);
    const [bulkResults, setBulkResults] = useState([]); // [{url, status, message}]
    const [bulkRunning, setBulkRunning] = useState(false);
    const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

    const registerOne = async (urlTrim, claveTrim) => {
        const qy = query(
            collection(db, "multilinks"),
            where("url", "==", urlTrim),
            where("clave_edicion", "==", claveTrim)
        );

        const snap = await getDocs(qy);
        if (snap.empty) return { ok: false, message: "URL o clave incorrecta." };

        const docSnap = snap.docs[0];
        const docRef = doc(db, "multilinks", docSnap.id);

        try {
            const result = await runTransaction(db, async (tx) => {
                const fresh = await tx.get(docRef);
                if (!fresh.exists()) return { ok: false, message: "El multilink ya no existe." };

                const data = fresh.data();

                // seguridad extra: revalidar clave (por si cambió entre query y tx)
                if (data.clave_edicion !== claveTrim) {
                    return { ok: false, message: "URL o clave incorrecta." };
                }

                const uid = usuario.uid;
                const miembros = Array.isArray(data.miembros) ? data.miembros : [];
                const max = Number(data.max_miembros ?? 1);

                // ya registrado por este usuario
                if (miembros.includes(uid)) {
                    return { ok: true, message: "Ya estaba registrado en tu cuenta." };
                }

                // cupos llenos
                if (miembros.length >= max + 1) {
                    return { ok: false, message: `Este multilink ya alcanzó el límite de ${max} cuenta(s).` };
                }

                const nuevosMiembros = [...miembros, uid];

                tx.update(docRef, {
                    miembros: nuevosMiembros,
                    // asigna dueño principal si aún no existe
                    uid_principal: data.uid_principal ?? uid,
                });

                return { ok: true, message: "Registrado." };
            });

            return result;
        } catch (err) {
            console.error(err);
            return { ok: false, message: "No se pudo registrar (intenta de nuevo)." };
        }
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

    // ---- CSV helpers ----
    const parseCSV = async (file) => {
        const text = await file.text();
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
            if (!urlVal) continue;
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
            for (let i = 0; i < rows.length; i++) {
                const { url, clave } = rows[i];
                const urlTrim = (url || "").trim();
                const claveTrim = (clave || "").trim();

                try {
                    const res = await registerOne(urlTrim, claveTrim);
                    results.push({ url: urlTrim, status: res.ok ? "ok" : "err", message: res.message });
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

    // --- Drag & drop UI state ---
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

    // progreso %
    const progressPct =
        bulkProgress.total ? Math.round((bulkProgress.done / bulkProgress.total) * 100) : 0;

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <button
                    className={`${styles.btn}`}
                    onClick={() => navigate(-1)}
                    type="button"
                    style={{ minWidth: "fit-content", marginBottom: 12 }}
                >
                    <i className="bi bi-arrow-left" aria-hidden></i> Volver
                </button>

                <div className={styles.title}>Registrar Multilink</div>
                <div className={styles.subtitle}>
                    Asocia uno o varios multilinks existentes a tu cuenta mediante la clave de edición.
                </div>

                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`} role="alert">
                        {error}
                    </div>
                )}
                {exito && (
                    <div className={`${styles.alert} ${styles.alertSuccess}`} role="status">
                        {exito}
                    </div>
                )}

                {/* Registro individual */}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="url">URL del multilink</label>
                            <input
                                id="url"
                                className={styles.input}
                                placeholder="ej. juanperez"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="clave">Clave de edición</label>
                            <div className={styles.inputWrap}>
                                <input
                                    id="clave"
                                    className={styles.input}
                                    type={showPwd ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)}
                                    autoComplete="off"
                                    required
                                />
                                <button
                                    type="button"
                                    className={styles.togglePwd}
                                    onClick={() => setShowPwd((s) => !s)}
                                    aria-label={showPwd ? "Ocultar contraseña" : "Ver contraseña"}
                                >
                                    {showPwd ? "Ocultar" : "Ver"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className={styles.btn} type="submit" disabled={loading}>
                        <i className="bi bi-bookmark-plus" aria-hidden></i>
                        {loading ? "Registrando..." : "Registrar"}
                    </button>
                </form>

                <div className={styles.divider} />

                {/* Registro masivo por CSV */}
                <div>
                    <div className={styles.subtitle} style={{ marginBottom: 8 }}>
                        Registro masivo por CSV
                    </div>
                    <div className={styles.hint} style={{ marginBottom: 10 }}>
                        Sube un archivo con encabezados <span className={styles.pill}>url</span> y{" "}
                        <span className={styles.pill}>clave</span>.
                    </div>

                    <div className={styles.uploadWrap}>
                        {/* Dropzone */}
                        <div
                            className={`${styles.dropzone} ${isDragOver ? styles.dragover : ""}`}
                            role="button"
                            tabIndex={0}
                            onClick={onDropzoneClick}
                            onKeyDown={onDropzoneKeyDown}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            aria-label="Cargar archivo CSV, clic o arrastra aquí"
                        >
                            <div className={styles.dropzoneInner}>
                                <div className={styles.titleSm}>
                                    <i className="bi bi-cloud-arrow-up" aria-hidden /> Clic o arrastra tu CSV aquí
                                </div>
                                <div className={styles.muted}>Tamaño recomendado &lt; 2MB</div>
                                <div className={styles.badges}>
                                    <span className={styles.badge}>.csv</span>
                                    <span className={styles.badge}>Separador , o ;</span>
                                    <span className={styles.badge}>Encabezados url, clave</span>
                                </div>
                            </div>

                            {/* input oculto */}
                            <input
                                id="csv-hidden-input"
                                type="file"
                                accept=".csv,text/csv"
                                style={{ display: "none" }}
                                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        {/* Chip archivo seleccionado */}
                        {csvFile && (
                            <div className={styles.fileChip} aria-live="polite">
                                <i className="bi bi-filetype-csv" aria-hidden />
                                <div style={{ display: "grid", gap: 2 }}>
                                    <div style={{ fontWeight: 700 }}>{csvFile.name}</div>
                                    <div className={styles.hintSm}>
                                        {(csvFile.size / 1024).toFixed(1)} KB
                                    </div>
                                </div>
                                <div className={styles.fileActions}>
                                    <button
                                        type="button"
                                        className={styles.iconBtn}
                                        onClick={clearCsv}
                                        title="Quitar archivo"
                                    >
                                        <i className="bi bi-x" aria-hidden />
                                    </button>
                                    <button
                                        className={styles.iconBtn}
                                        type="button"
                                        onClick={handleCSVRun}
                                        disabled={bulkRunning}
                                        title="Procesar CSV"
                                    >
                                        {bulkRunning ? (
                                            <i className="bi bi-hourglass-split" aria-hidden />
                                        ) : (
                                            <i className="bi bi-play-fill" aria-hidden />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Barra de progreso */}
                        {bulkRunning && (
                            <div>
                                <div className={styles.progress} aria-label="Progreso de procesamiento">
                                    <span style={{ width: `${progressPct}%` }} />
                                </div>
                                <div className={styles.hintSm} style={{ marginTop: 6 }}>
                                    {bulkProgress.done} / {bulkProgress.total} procesados
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tabla de resultados */}
                    {bulkResults.length > 0 && (
                        <div className={styles.results} style={{ marginTop: 12 }}>
                            <table className={styles.table}>
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
                                        <td className={r.status === "ok" ? styles.ok : styles.err}>
                                            {r.status === "ok" ? (
                                                <>
                                                    <i className="bi bi-check-circle" aria-hidden /> OK
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-exclamation-triangle" aria-hidden /> ERROR
                                                </>
                                            )}
                                        </td>
                                        <td>{r.message}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    Powered by{" "}
                    <a
                        href="https://www.gibracompany.com/"
                        target="_blank"
                        rel="noreferrer"
                        className={styles.linkAnchor}
                    >
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}
