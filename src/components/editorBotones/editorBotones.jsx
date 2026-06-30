import { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableBotonItem } from "./SortableBotonItem";
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
            id: crypto.randomUUID(),
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = botones.findIndex((b) => b.id === active.id);
            const newIndex = botones.findIndex((b) => b.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const nuevos = [...botones];
                const [reorderedItem] = nuevos.splice(oldIndex, 1);
                nuevos.splice(newIndex, 0, reorderedItem);
                setBotones(nuevos);
            }
        }
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
                <div className={styles.quickAddBtn} onClick={() => agregarBotonRapido("boton_imagen_texto")}>
                    <i className="bi bi-card-image" />
                    <span>Img+Texto</span>
                </div>
            </div>

            <hr className={styles.hr} />
            <h3 className={styles.title}>Tus Bloques</h3>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={botones.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    <Accordion activeKey={activeKeys} onSelect={setActiveKeys} alwaysOpen className={styles.acc}>
                        {botones.map((b, i) => (
                            <SortableBotonItem 
                                key={b.id}
                                b={b}
                                i={i}
                                handleBotonEdit={handleBotonEdit}
                                eliminarBoton={eliminarBoton}
                                inferTipoFromUrl={inferTipoFromUrl}
                                placeholderPorTipo={placeholderPorTipo}
                            />
                        ))}
                    </Accordion>
                </SortableContext>
            </DndContext>
        </div>
    );
}

export default EditorBotones;
