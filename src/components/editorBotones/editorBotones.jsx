import { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import styles from "./editorBotones.module.css";
import IconPicker from "./IconPicker";
import SubirImagen from "../subirImagenes/subirImagen";

const WA_PREFIX = "https://wa.me/";
const MAIL_PREFIX = "mailto:";

function stripKnownPrefixes(u = "") {
    return u.replace(/^https?:\/\/wa\.me\/|^mailto:/, "");
}
function ensurePrefix(tipo, u = "") {
    const base = stripKnownPrefixes(u);
    if (tipo === "whatsapp") return WA_PREFIX + base;
    if (tipo === "correo") return MAIL_PREFIX + base;
    return base; // sin prefijo
}
function inferTipoFromUrl(u = "") {
    if (u.startsWith(WA_PREFIX)) return "whatsapp";
    if (u.startsWith(MAIL_PREFIX)) return "correo";
    return "normal";
}

function EditorBotones({ botones, setBotones }) {
    const [activeKeys, setActiveKeys] = useState(["0"]);

    const handleBotonEdit = (index, campo, valor) => {
        const nuevos = [...botones];
        // si cambia el tipo en un botón existente, ajustamos su URL
        if (campo === "tipo") {
            nuevos[index][campo] = valor;
            nuevos[index].url = ensurePrefix(valor, nuevos[index].url);
        } else if (campo === "url") {
            // al editar URL, mantenemos el prefijo según el tipo
            const tipo = nuevos[index].tipo || inferTipoFromUrl(nuevos[index].url);
            if (tipo === "normal") {
                nuevos[index].url = stripKnownPrefixes(valor);
            } else {
                // re-aplicamos el prefijo correcto sobre lo que escribió
                nuevos[index].url = ensurePrefix(tipo, valor);
            }
        } else {
            nuevos[index][campo] = valor;
        }
        setBotones(nuevos);
    };

    const eliminarBoton = (index) => {
        const nuevos = [...botones];
        nuevos.splice(index, 1);
        setBotones(nuevos);
    };

    const agregarBotonRapido = (tipo) => {
        const nuevos = [...botones];
        const indexResFormulario = nuevos.findIndex((b) => b.tipo === "ResFormulario");
        
        let textoPredefinido = "Nuevo Botón";
        let iconoPredefinido = "bi-link-45deg";
        
        if (tipo === "youtube") { textoPredefinido = "Video de YouTube"; iconoPredefinido = "bi-youtube"; }
        if (tipo === "mapa") { textoPredefinido = "Mapa de Google"; iconoPredefinido = "bi-geo-alt"; }
        if (tipo === "texto") { textoPredefinido = "Bloque de texto"; iconoPredefinido = "bi-text-paragraph"; }
        if (tipo === "seccion") { textoPredefinido = "Nueva Sección"; iconoPredefinido = "bi-hr"; }
        if (tipo === "imagen") { textoPredefinido = ""; iconoPredefinido = "bi-image"; }
        if (tipo === "whatsapp") { iconoPredefinido = "bi-whatsapp"; }
        if (tipo === "correo") { iconoPredefinido = "bi-envelope"; }
        
        const nuevo = {
            tipo,
            texto: textoPredefinido,
            url: "",
            icono: iconoPredefinido,
            ancho_video: "100",
            forma: "rectangular",
            bg_color: localStorage.getItem("ultimo_bg_color") || "#ffffff",
            text_color: localStorage.getItem("ultimo_text_color") || "#3aabd4",
            icon_color: localStorage.getItem("ultimo_icon_color") || "#3aabd4",
            borde_color: localStorage.getItem("ultimo_borde_color") || "#000000",
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || "0",
        };

        if (indexResFormulario !== -1) nuevos.splice(indexResFormulario, 0, nuevo);
        else nuevos.push(nuevo);

        setBotones(nuevos);
        
        const insertedIndex = indexResFormulario !== -1 ? indexResFormulario : nuevos.length - 1;
        setActiveKeys((prev) => [...prev, insertedIndex.toString()]);
    };

    const moverBotonArriba = (index) => {
        if (index === 0) return;
        const nuevos = [...botones];
        [nuevos[index - 1], nuevos[index]] = [nuevos[index], nuevos[index - 1]];
        setBotones(nuevos);
    };

    const moverBotonAbajo = (index) => {
        if (index === botones.length - 1) return;
        const nuevos = [...botones];
        [nuevos[index + 1], nuevos[index]] = [nuevos[index], nuevos[index + 1]];
        setBotones(nuevos);
    };

    const placeholderPorTipo = (tipo) => {
        if (tipo === "whatsapp") return "https://wa.me/ + tu número (solo números sin +)";
        if (tipo === "correo") return "mailto: + tu correo";
        if (tipo === "mapa") return "https://www.google.com/maps/embed?...";
        return "URL completa (https://...)";
    };

    return (
        <div className={styles.root}>
            <h3 className={styles.title}>Añadir Bloques</h3>
            
            <div className={styles.quickAddGrid}>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("normal")}>
                    <i className="bi bi-link-45deg" />
                    <span>Enlace</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("whatsapp")}>
                    <i className="bi bi-whatsapp" />
                    <span>WhatsApp</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("correo")}>
                    <i className="bi bi-envelope" />
                    <span>Correo</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("youtube")}>
                    <i className="bi bi-youtube" />
                    <span>YouTube</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("mapa")}>
                    <i className="bi bi-geo-alt" />
                    <span>Ubicación</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("texto")}>
                    <i className="bi bi-text-paragraph" />
                    <span>Texto</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("seccion")}>
                    <i className="bi bi-hr" />
                    <span>Sección</span>
                </div>
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("imagen")}>
                    <i className="bi bi-image" />
                    <span>Imagen</span>
                </div>
            </div>

            <hr className={styles.hr} />
            <h3 className={styles.title}>Tus Bloques</h3>

            <Accordion activeKey={activeKeys} onSelect={setActiveKeys} alwaysOpen className={styles.acc}>
                {botones.map((b, i) => {
                    const tipoActual = b.tipo || inferTipoFromUrl(b.url);
                    return (
                        <Accordion.Item eventKey={i.toString()} key={i} className={styles.item}>
                            <Accordion.Header>
                                <div className={styles.itemhead}>
                                    <span className={styles.badge}>#{i + 1}</span>
                                    <span className={styles.itemtitle}>
                                        {tipoActual === "youtube" ? "Video YouTube" : 
                                         tipoActual === "mapa" ? "Mapa de Ubicación" : 
                                         tipoActual === "texto" ? "Bloque de Texto" :
                                         tipoActual === "seccion" ? "Sección / Título" :
                                         tipoActual === "imagen" ? "Bloque de Imagen" :
                                         (b.texto || "Sin texto")}
                                    </span>
                                </div>
                            </Accordion.Header>

                            <Accordion.Body className={styles.body}>
                                <div className={styles.sectionTitle}>Contenido</div>
                                
                                <div className="mb-3">
                                    <label className={styles.label}>Tipo de Bloque</label>
                                    <select
                                        className={styles.input}
                                        value={tipoActual}
                                        onChange={(e) => handleBotonEdit(i, "tipo", e.target.value)}
                                        disabled={b.tipo === "ResFormulario"}
                                    >
                                        <option value="normal">Botón Enlace</option>
                                        <option value="whatsapp">Botón WhatsApp</option>
                                        <option value="correo">Botón Correo</option>
                                        <option value="youtube">Video YouTube</option>
                                        <option value="mapa">Mapa de Ubicación</option>
                                        <option value="texto">Bloque de Texto</option>
                                        <option value="seccion">Sección / Título</option>
                                        <option value="imagen">Imagen</option>
                                        {b.tipo === "ResFormulario" && (
                                            <option value="ResFormulario">ResFormulario</option>
                                        )}
                                    </select>
                                </div>

                                {["normal", "whatsapp", "correo", "ResFormulario", "texto", "seccion"].includes(tipoActual) && (
                                    <div className="mb-3">
                                        <label className={styles.label}>Texto</label>
                                        {tipoActual === "texto" ? (
                                            <textarea
                                                className={styles.input}
                                                value={b.texto || ""}
                                                onChange={(e) => handleBotonEdit(i, "texto", e.target.value)}
                                                rows="3"
                                            />
                                        ) : (
                                            <input
                                                className={styles.input}
                                                value={b.texto || ""}
                                                onChange={(e) => handleBotonEdit(i, "texto", e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}

                                {["normal", "whatsapp", "correo", "youtube", "mapa", "ResFormulario"].includes(tipoActual) && (
                                    <div className="mb-3">
                                        <label className={styles.label}>URL {tipoActual === "youtube" ? "del Video" : tipoActual === "mapa" ? "del Mapa Embed" : ""}</label>
                                        <input
                                            className={styles.input}
                                            value={b.url || ""}
                                            placeholder={
                                                tipoActual === "youtube" ? "https://www.youtube.com/watch?v=..." :
                                                placeholderPorTipo(tipoActual)
                                            }
                                            onChange={(e) => handleBotonEdit(i, "url", e.target.value)}
                                            readOnly={b.tipo === "ResFormulario"}
                                        />
                                    </div>
                                )}
                                
                                {tipoActual === "imagen" && (
                                    <div className="mb-3">
                                        <label className={styles.label}>Subir Imagen</label>
                                        <SubirImagen
                                            urlInicial={b.url}
                                            carpeta="bloques_imagenes"
                                            onUploadSuccess={(url) => handleBotonEdit(i, "url", url || "")}
                                        />
                                    </div>
                                )}

                                {["normal", "whatsapp", "correo", "ResFormulario"].includes(tipoActual) && (
                                    <div className="row g-2 mb-3">
                                        <div className="col">
                                            <label className={styles.label}>Icono</label>
                                            <IconPicker
                                                value={b.icono}
                                                onChange={(val) => handleBotonEdit(i, "icono", val)}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                {["normal", "whatsapp", "correo", "texto", "seccion", "imagen", "youtube"].includes(tipoActual) && (
                                    <div className={styles.sectionTitle}>Diseño y Estilo</div>
                                )}
                                
                                {["normal", "whatsapp", "correo", "ResFormulario"].includes(tipoActual) && (
                                    <div className="row g-2 mb-3">
                                        <div className="col">
                                            <label className={styles.label}>Forma del Botón</label>
                                            <select
                                                className={styles.input}
                                                value={b.forma || "rectangular"}
                                                onChange={(e) => handleBotonEdit(i, "forma", e.target.value)}
                                            >
                                                <option value="rectangular">Rectangular</option>
                                                <option value="circular">Circular (Solo ícono)</option>
                                            </select>
                                        </div>
                                        <div className="col d-flex align-items-center">
                                            <div className="form-check form-switch mt-4">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id={`glassmorphism-${i}`}
                                                    checked={b.glassmorphism || false}
                                                    onChange={(e) => handleBotonEdit(i, "glassmorphism", e.target.checked)}
                                                    style={{ cursor: "pointer" }}
                                                />
                                                <label className="form-check-label ms-2" htmlFor={`glassmorphism-${i}`} style={{ fontSize: '13px', fontWeight: 'bold', color: '#555', cursor: 'pointer' }}>
                                                    Efecto Cristal
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {tipoActual === "texto" && (
                                    <div className="row g-2 mb-3">
                                        <div className="col">
                                            <label className={styles.label}>Alineación</label>
                                            <select
                                                className={styles.input}
                                                value={b.alineacion || "center"}
                                                onChange={(e) => handleBotonEdit(i, "alineacion", e.target.value)}
                                            >
                                                <option value="left">Izquierda</option>
                                                <option value="center">Centro</option>
                                                <option value="right">Derecha</option>
                                                <option value="justify">Justificado</option>
                                            </select>
                                        </div>
                                        <div className="col">
                                            <label className={styles.label}>Tamaño (ej: 16px)</label>
                                            <input
                                                className={styles.input}
                                                value={b.tamano || "16px"}
                                                onChange={(e) => handleBotonEdit(i, "tamano", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {["normal", "whatsapp", "correo", "ResFormulario", "texto", "seccion"].includes(tipoActual) && (
                                    <div className="row g-2">
                                        {["normal", "whatsapp", "correo", "ResFormulario"].includes(tipoActual) && (
                                            <div className="col">
                                                <label className={styles.label}>Color del fondo</label>
                                                <input
                                                    type="color"
                                                    className={styles.color}
                                                    value={b.bg_color}
                                                    onChange={(e) => handleBotonEdit(i, "bg_color", e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {tipoActual === "seccion" && (
                                            <div className="col">
                                                <label className={styles.label}>Color de la línea</label>
                                                <input
                                                    type="color"
                                                    className={styles.color}
                                                    value={b.borde_color}
                                                    onChange={(e) => handleBotonEdit(i, "borde_color", e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className="col">
                                            <label className={styles.label}>Color del texto</label>
                                            <input
                                                type="color"
                                                className={styles.color}
                                                value={b.text_color}
                                                onChange={(e) => handleBotonEdit(i, "text_color", e.target.value)}
                                            />
                                        </div>
                                        {["normal", "whatsapp", "correo", "ResFormulario"].includes(tipoActual) && (
                                            <div className="col">
                                                <label className={styles.label}>Color del ícono</label>
                                                <input
                                                    type="color"
                                                    className={styles.color}
                                                    value={b.icon_color}
                                                    onChange={(e) => handleBotonEdit(i, "icon_color", e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {["normal", "whatsapp", "correo", "youtube", "imagen", "mapa", "ResFormulario"].includes(tipoActual) && (
                                    <div className="row g-2 mt-2">
                                        <div className="col">
                                            <label className={styles.label}>Color del borde</label>
                                            <input
                                                type="color"
                                                className={styles.color}
                                                value={b.borde_color}
                                                onChange={(e) => handleBotonEdit(i, "borde_color", e.target.value)}
                                            />
                                        </div>
                                        {["youtube", "mapa"].includes(tipoActual) && (
                                            <div className="col">
                                                <label className={styles.label}>Ancho (%)</label>
                                                <input
                                                    className={styles.input}
                                                    type="number"
                                                    min="10"
                                                    max="100"
                                                    value={b.ancho_video || "100"}
                                                    onChange={(e) => handleBotonEdit(i, "ancho_video", e.target.value)}
                                                />
                                            </div>
                                        )}
                                        {tipoActual === "mapa" && (
                                            <div className="col">
                                                <label className={styles.label}>Alto (px)</label>
                                                <input
                                                    className={styles.input}
                                                    type="number"
                                                    min="100"
                                                    max="800"
                                                    value={b.alto_mapa || "300"}
                                                    onChange={(e) => handleBotonEdit(i, "alto_mapa", e.target.value)}
                                                />
                                            </div>
                                        )}
                                        <div className="col">
                                            <label className={styles.label}>Grosor del borde/radio (px)</label>
                                            <input
                                                className={styles.input}
                                                type="number"
                                                min="0"
                                                max="30"
                                                value={b.borde_grosor || 0}
                                                onChange={(e) => handleBotonEdit(i, "borde_grosor", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex flex-wrap gap-2 mt-3">
                                    {!b.fijo && (
                                        <button
                                            className={`${styles.btn} ${styles.danger}`}
                                            onClick={() => eliminarBoton(i)}
                                        >
                                            <i className="bi bi-x-circle" /> Eliminar
                                        </button>
                                    )}
                                    <button
                                        className={`${styles.btn} ${styles.outline}`}
                                        onClick={() => moverBotonArriba(i)}
                                        disabled={i === 0}
                                    >
                                        <i className="bi bi-arrow-up" /> Subir
                                    </button>
                                    <button
                                        className={`${styles.btn} ${styles.outline}`}
                                        onClick={() => moverBotonAbajo(i)}
                                        disabled={i === botones.length - 1}
                                    >
                                        <i className="bi bi-arrow-down" /> Bajar
                                    </button>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    );
                })}
            </Accordion>
        </div>
    );
}

export default EditorBotones;
