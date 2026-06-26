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
    const [nuevoBoton, setNuevoBoton] = useState({
        url: "",
        texto: "",
        icono: "",
        bg_color: "#ffffff",
        text_color: "#3aabd4",
        icon_color: "#3aabd4",
        borde_color: "#ffffff",
        borde_grosor: "0",
        ancho_video: "100",
        tipo: "normal",
    });

    useEffect(() => {
        const bg_color = localStorage.getItem("ultimo_bg_color") || "#ffffff";
        const text_color = localStorage.getItem("ultimo_text_color") || "#3aabd4";
        const icon_color = localStorage.getItem("ultimo_icon_color") || "#3aabd4";
        const borde_color = localStorage.getItem("ultimo_borde_color") || "#000000";
        const borde_grosor = localStorage.getItem("ultimo_borde_grosor") || "0";
        setNuevoBoton((prev) => ({
            ...prev,
            bg_color,
            text_color,
            icon_color,
            borde_color,
            borde_grosor,
        }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoBoton((prev) => {
            let next = { ...prev, [name]: value };
            // si cambia el tipo, ajustamos la URL con el prefijo correcto
            if (name === "tipo") {
                next.url = ensurePrefix(value, prev.url);
            }
            return next;
        });
        if (
            ["bg_color", "text_color", "icon_color", "borde_color", "borde_grosor"].includes(name)
        ) {
            localStorage.setItem(`ultimo_${name}`, value);
        }
    };

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

    const agregarBoton = () => {
        const nuevos = [...botones];
        const indexResFormulario = nuevos.findIndex((b) => b.tipo === "ResFormulario");
        const nuevo = {
            ...nuevoBoton,
            // persistimos últimos colores elegidos
            bg_color: localStorage.getItem("ultimo_bg_color") || nuevoBoton.bg_color,
            text_color: localStorage.getItem("ultimo_text_color") || nuevoBoton.text_color,
            icon_color: localStorage.getItem("ultimo_icon_color") || nuevoBoton.icon_color,
            borde_color: localStorage.getItem("ultimo_borde_color") || nuevoBoton.borde_color,
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || nuevoBoton.borde_grosor,
            // aseguramos URL con prefijo correcto según tipo
            url:
                nuevoBoton.tipo === "normal"
                    ? stripKnownPrefixes(nuevoBoton.url)
                    : ensurePrefix(nuevoBoton.tipo, nuevoBoton.url),
        };

        if (indexResFormulario !== -1) nuevos.splice(indexResFormulario, 0, nuevo);
        else nuevos.push(nuevo);

        setBotones(nuevos);
        setNuevoBoton((prev) => ({
            ...prev,
            url: "",
            texto: "",
            icono: "",
            ancho_video: "100",
            tipo: "normal",
            bg_color: localStorage.getItem("ultimo_bg_color") || "#ffffff",
            text_color: localStorage.getItem("ultimo_text_color") || "#3aabd4",
            icon_color: localStorage.getItem("ultimo_icon_color") || "#3aabd4",
            borde_color: localStorage.getItem("ultimo_borde_color") || "#000000",
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || "0",
        }));
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
        if (tipo === "whatsapp") return "https://wa.me/ + tu número (solo números)";
        if (tipo === "correo") return "mailto: + tu correo";
        return "URL completa (https://...)";
    };

    return (
        <div className={styles.root}>
            <h3 className={styles.title}>Bloques / Botones</h3>

            <Accordion defaultActiveKey="0" alwaysOpen className={styles.acc}>
                {botones.map((b, i) => {
                    const tipoActual = b.tipo || inferTipoFromUrl(b.url);
                    return (
                        <Accordion.Item eventKey={i.toString()} key={i} className={styles.item}>
                            <Accordion.Header>
                                <div className={styles.itemhead}>
                                    <span className={styles.badge}>#{i + 1}</span>
                                    <span className={styles.itemtitle}>
                                        {tipoActual === "youtube" ? "Video YouTube" : 
                                         tipoActual === "texto" ? "Bloque de Texto" :
                                         tipoActual === "seccion" ? "Sección / Título" :
                                         tipoActual === "imagen" ? "Bloque de Imagen" :
                                         (b.texto || "Sin texto")}
                                    </span>
                                </div>
                            </Accordion.Header>

                            <Accordion.Body className={styles.body}>
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
                                                value={b.texto}
                                                onChange={(e) => handleBotonEdit(i, "texto", e.target.value)}
                                            />
                                        )}
                                    </div>
                                )}

                                {["normal", "whatsapp", "correo", "youtube", "ResFormulario"].includes(tipoActual) && (
                                    <div className="mb-3">
                                        <label className={styles.label}>URL {tipoActual === "youtube" ? "del Video" : ""}</label>
                                        <input
                                            className={styles.input}
                                            value={b.url}
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
                                    <div className="mb-3">
                                        <label className={styles.label}>Icono</label>
                                        <IconPicker
                                            value={b.icono}
                                            onChange={(val) => handleBotonEdit(i, "icono", val)}
                                        />
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

                                {["normal", "whatsapp", "correo", "youtube", "imagen", "ResFormulario"].includes(tipoActual) && (
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
                                        {tipoActual === "youtube" && (
                                            <div className="col">
                                                <label className={styles.label}>Ancho Video (%)</label>
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

            <hr className={styles.hr} />
            <h3 className={styles.title}>Agregar nuevo bloque</h3>

            <div className="mb-2">
                <label className={styles.label}>Tipo de Bloque</label>
                <select
                    name="tipo"
                    className={styles.input}
                    value={nuevoBoton.tipo}
                    onChange={handleInputChange}
                >
                    <option value="normal">Botón Enlace</option>
                    <option value="whatsapp">Botón WhatsApp</option>
                    <option value="correo">Botón Correo</option>
                    <option value="youtube">Video YouTube</option>
                    <option value="texto">Bloque de Texto</option>
                    <option value="seccion">Sección / Título</option>
                    <option value="imagen">Imagen</option>
                </select>
            </div>

            {["normal", "whatsapp", "correo", "texto", "seccion"].includes(nuevoBoton.tipo) && (
                <div className="mb-2">
                    <label className={styles.label}>Texto</label>
                    {nuevoBoton.tipo === "texto" ? (
                        <textarea
                            name="texto"
                            className={styles.input}
                            value={nuevoBoton.texto}
                            onChange={handleInputChange}
                            rows="3"
                        />
                    ) : (
                        <input
                            name="texto"
                            placeholder="Texto"
                            className={styles.input}
                            value={nuevoBoton.texto}
                            onChange={handleInputChange}
                        />
                    )}
                </div>
            )}

            {["normal", "whatsapp", "correo", "youtube"].includes(nuevoBoton.tipo) && (
                <div className="mb-2">
                    <label className={styles.label}>URL {nuevoBoton.tipo === "youtube" ? "del Video" : ""}</label>
                    <input
                        name="url"
                        placeholder={
                            nuevoBoton.tipo === "whatsapp" ? "https://wa.me/ + tu número (solo números)" :
                            nuevoBoton.tipo === "correo" ? "mailto: + tu correo" :
                            nuevoBoton.tipo === "youtube" ? "https://www.youtube.com/watch?v=..." :
                            "URL completa (https://...)"
                        }
                        className={styles.input}
                        value={nuevoBoton.url}
                        onChange={handleInputChange}
                    />
                </div>
            )}
            
            {nuevoBoton.tipo === "imagen" && (
                <div className="mb-2">
                    <label className={styles.label}>Subir Imagen</label>
                    <SubirImagen
                        urlInicial={nuevoBoton.url}
                        carpeta="bloques_imagenes"
                        onUploadSuccess={(url) => setNuevoBoton((p) => ({ ...p, url: url || "" }))}
                    />
                </div>
            )}

            {["normal", "whatsapp", "correo"].includes(nuevoBoton.tipo) && (
                <div className="mb-3">
                    <label className={styles.label}>Icono</label>
                    <IconPicker
                        value={nuevoBoton.icono}
                        onChange={(val) => setNuevoBoton((p) => ({ ...p, icono: val }))}
                    />
                </div>
            )}
            
            {nuevoBoton.tipo === "texto" && (
                <div className="row g-2 mb-3">
                    <div className="col">
                        <label className={styles.label}>Alineación</label>
                        <select
                            name="alineacion"
                            className={styles.input}
                            value={nuevoBoton.alineacion || "center"}
                            onChange={handleInputChange}
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
                            name="tamano"
                            className={styles.input}
                            value={nuevoBoton.tamano || "16px"}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            )}

            {["normal", "whatsapp", "correo", "texto", "seccion"].includes(nuevoBoton.tipo) && (
                <div className="row g-2 mt-2">
                    {["normal", "whatsapp", "correo"].includes(nuevoBoton.tipo) && (
                        <div className="col">
                            <label className={styles.label}>Color del fondo</label>
                            <input
                                type="color"
                                name="bg_color"
                                className={styles.color}
                                value={nuevoBoton.bg_color}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    {nuevoBoton.tipo === "seccion" && (
                        <div className="col">
                            <label className={styles.label}>Color de la línea</label>
                            <input
                                type="color"
                                name="borde_color"
                                className={styles.color}
                                value={nuevoBoton.borde_color}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <div className="col">
                        <label className={styles.label}>Color del texto</label>
                        <input
                            type="color"
                            name="text_color"
                            className={styles.color}
                            value={nuevoBoton.text_color}
                            onChange={handleInputChange}
                        />
                    </div>
                    {["normal", "whatsapp", "correo"].includes(nuevoBoton.tipo) && (
                        <div className="col">
                            <label className={styles.label}>Color del ícono</label>
                            <input
                                type="color"
                                name="icon_color"
                                className={styles.color}
                                value={nuevoBoton.icon_color}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                </div>
            )}

            {["normal", "whatsapp", "correo", "youtube", "imagen"].includes(nuevoBoton.tipo) && (
                <div className="row g-2 mt-2">
                    <div className="col">
                        <label className={styles.label}>Color del borde</label>
                        <input
                            type="color"
                            name="borde_color"
                            className={styles.color}
                            value={nuevoBoton.borde_color}
                            onChange={handleInputChange}
                        />
                    </div>
                    {nuevoBoton.tipo === "youtube" && (
                        <div className="col">
                            <label className={styles.label}>Ancho Video (%)</label>
                            <input
                                className={styles.input}
                                type="number"
                                name="ancho_video"
                                min="10"
                                max="100"
                                value={nuevoBoton.ancho_video || "100"}
                                onChange={handleInputChange}
                            />
                        </div>
                    )}
                    <div className="col">
                        <label className={styles.label}>Grosor del borde (px)</label>
                        <input
                            className={styles.input}
                            type="number"
                            name="borde_grosor"
                            min="0"
                            max="30"
                            value={nuevoBoton.borde_grosor}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>
            )}

            <button className={`${styles.btn} ${styles.success} mt-2`} onClick={agregarBoton}>
                <i className="bi bi-plus-circle" /> Agregar
            </button>
        </div>
    );
}

export default EditorBotones;

