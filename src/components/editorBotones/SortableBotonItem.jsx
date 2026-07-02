import { Accordion } from "react-bootstrap";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./editorBotones.module.css";
import IconPicker from "./IconPicker";
import SubirImagen from "../subirImagenes/subirImagen";

export function SortableBotonItem({ 
    b, 
    i: index, 
    handleBotonEdit, 
    eliminarBoton, 
    inferTipoFromUrl, 
    placeholderPorTipo 
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 99 : "auto",
        position: "relative",
        opacity: isDragging ? 0.8 : 1,
    };

    const tipoActual = b.tipo || inferTipoFromUrl(b.url);

    return (
        <Accordion.Item ref={setNodeRef} style={style} eventKey={b.id} className={styles.item}>
            <Accordion.Header>
                <div className={styles.itemhead}>
                    <span 
                        {...attributes} 
                        {...listeners} 
                        style={{ cursor: "grab", marginRight: "12px", color: "#6c757d" }}
                        title="Arrastrar para reordenar"
                    >
                        <i className="bi bi-grid-3x3-gap-fill fs-5"></i>
                    </span>
                    <span className={styles.badge}>#{index + 1}</span>
                    <span className={styles.itemtitle}>
                        {tipoActual === "youtube" ? "Video YouTube" : 
                         tipoActual === "mapa" ? "Mapa de Ubicación" : 
                         tipoActual === "texto" ? "Bloque de Texto" :
                         tipoActual === "seccion" ? "Sección / Título" :
                         tipoActual === "imagen" ? "Bloque de Imagen" :
                         tipoActual === "boton_imagen_texto" ? "Botón Img + Texto" :
                         (b.texto || "Sin texto")}
                    </span>
                </div>
            </Accordion.Header>

            <Accordion.Body className={styles.body}>
                <div className={styles.sectionTitle}>Contenido</div>
                
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className={styles.label}>Tipo de Bloque</label>
                        <select
                            className={styles.input}
                            value={tipoActual}
                            onChange={(e) => handleBotonEdit(index, "tipo", e.target.value)}
                            disabled={b.tipo === "ResFormulario" || b.tipo === "ResValoracion"}
                        >
                            <option value="normal">Botón Enlace</option>
                            <option value="whatsapp">Botón WhatsApp</option>
                            <option value="correo">Botón Correo</option>
                            <option value="youtube">Video YouTube</option>
                            <option value="mapa">Mapa de Ubicación</option>
                            <option value="texto">Bloque de Texto</option>
                            <option value="seccion">Sección / Título</option>
                            <option value="imagen">Imagen</option>
                            <option value="boton_imagen_texto">Botón Img + Texto</option>
                            {b.tipo === "ResFormulario" && (
                                <option value="ResFormulario">ResFormulario</option>
                            )}
                            {b.tipo === "ResValoracion" && (
                                <option value="ResValoracion">ResValoracion</option>
                            )}
                        </select>
                    </div>

                    {["normal", "whatsapp", "correo", "ResFormulario", "ResValoracion", "texto", "seccion", "boton_imagen_texto"].includes(tipoActual) && (
                        <div className={tipoActual === "texto" ? "col-12" : "col-md-6"}>
                            <label className={styles.label}>Texto</label>
                            {tipoActual === "texto" ? (
                                <textarea
                                    className={styles.input}
                                    value={b.texto || ""}
                                    onChange={(e) => handleBotonEdit(index, "texto", e.target.value)}
                                    rows="3"
                                />
                            ) : (
                                <input
                                    className={styles.input}
                                    value={b.texto || ""}
                                    onChange={(e) => handleBotonEdit(index, "texto", e.target.value)}
                                />
                            )}
                        </div>
                    )}

                    {["normal", "whatsapp", "correo", "youtube", "mapa", "ResFormulario", "ResValoracion", "boton_imagen_texto"].includes(tipoActual) && (
                        <div className="col-md-6">
                            <label className={styles.label}>URL {tipoActual === "youtube" ? "del Video" : tipoActual === "mapa" ? "del Mapa Embed" : ""}</label>
                            <input
                                className={styles.input}
                                value={b.url || ""}
                                placeholder={
                                    tipoActual === "youtube" ? "https://www.youtube.com/watch?v=..." :
                                    placeholderPorTipo(tipoActual)
                                }
                                onChange={(e) => handleBotonEdit(index, "url", e.target.value)}
                                readOnly={b.tipo === "ResFormulario" || b.tipo === "ResValoracion"}
                            />
                        </div>
                    )}
                    
                    {["imagen", "boton_imagen_texto"].includes(tipoActual) && (
                        <div className="col-md-6">
                            <label className={styles.label}>Subir Imagen</label>
                            <SubirImagen
                                urlInicial={tipoActual === "imagen" ? b.url : b.imagen_url}
                                carpeta="bloques_imagenes"
                                onUploadSuccess={(url) => handleBotonEdit(index, tipoActual === "imagen" ? "url" : "imagen_url", url || "")}
                            />
                        </div>
                    )}

                    {["normal", "whatsapp", "correo", "ResFormulario", "ResValoracion"].includes(tipoActual) && (
                        <div className="col-md-6">
                            <label className={styles.label}>Icono</label>
                            <IconPicker
                                value={b.icono}
                                onChange={(val) => handleBotonEdit(index, "icono", val)}
                            />
                        </div>
                    )}
                </div>
                
                {["normal", "whatsapp", "correo", "texto", "seccion", "imagen", "youtube", "boton_imagen_texto"].includes(tipoActual) && (
                    <div className={styles.sectionTitle}>Diseño y Estilo</div>
                )}
                
                {["normal", "whatsapp", "correo", "ResFormulario", "ResValoracion", "boton_imagen_texto"].includes(tipoActual) && (
                    <div className="row g-2 mb-3">
                        <div className="col">
                            <label className={styles.label}>Forma del Botón</label>
                            <select
                                className={styles.input}
                                value={b.forma || "rectangular"}
                                onChange={(e) => handleBotonEdit(index, "forma", e.target.value)}
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
                                    id={`glassmorphism-${index}`}
                                    checked={b.glassmorphism || false}
                                    onChange={(e) => handleBotonEdit(index, "glassmorphism", e.target.checked)}
                                    style={{ cursor: "pointer" }}
                                />
                                <label className="form-check-label ms-2" htmlFor={`glassmorphism-${index}`} style={{ fontSize: '13px', fontWeight: 'bold', color: '#555', cursor: 'pointer' }}>
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
                                onChange={(e) => handleBotonEdit(index, "alineacion", e.target.value)}
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
                                onChange={(e) => handleBotonEdit(index, "tamano", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {["normal", "whatsapp", "correo", "ResFormulario", "ResValoracion", "texto", "seccion", "boton_imagen_texto"].includes(tipoActual) && (
                    <div className="row g-2">
                        {["normal", "whatsapp", "correo", "ResFormulario", "ResValoracion", "boton_imagen_texto"].includes(tipoActual) && (
                            <div className="col">
                                <label className={styles.label}>Color del fondo</label>
                                <input
                                    type="color"
                                    className={styles.color}
                                    value={b.bg_color}
                                    onChange={(e) => handleBotonEdit(index, "bg_color", e.target.value)}
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
                                    onChange={(e) => handleBotonEdit(index, "borde_color", e.target.value)}
                                />
                            </div>
                        )}
                        <div className="col">
                            <label className={styles.label}>Color del texto</label>
                            <input
                                type="color"
                                className={styles.color}
                                value={b.text_color}
                                onChange={(e) => handleBotonEdit(index, "text_color", e.target.value)}
                            />
                        </div>
                        {["normal", "whatsapp", "correo", "ResFormulario", "ResValoracion"].includes(tipoActual) && (
                            <div className="col">
                                <label className={styles.label}>Color del ícono</label>
                                <input
                                    type="color"
                                    className={styles.color}
                                    value={b.icon_color}
                                    onChange={(e) => handleBotonEdit(index, "icon_color", e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {["normal", "whatsapp", "correo", "youtube", "imagen", "mapa", "ResFormulario", "ResValoracion", "boton_imagen_texto"].includes(tipoActual) && (
                    <div className="row g-2 mt-2">
                        <div className="col">
                            <label className={styles.label}>Color del borde</label>
                            <input
                                type="color"
                                className={styles.color}
                                value={b.borde_color}
                                onChange={(e) => handleBotonEdit(index, "borde_color", e.target.value)}
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
                                    onChange={(e) => handleBotonEdit(index, "ancho_video", e.target.value)}
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
                                    onChange={(e) => handleBotonEdit(index, "alto_mapa", e.target.value)}
                                />
                            </div>
                        )}
                        <div className="col">
                            <label className={styles.label}>Grosor (px)</label>
                            <input
                                className={styles.input}
                                type="number"
                                min="0"
                                max="30"
                                value={b.borde_grosor || 0}
                                onChange={(e) => handleBotonEdit(index, "borde_grosor", e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="d-flex flex-wrap gap-2 mt-3">
                    {!b.fijo && (
                        <button
                            className={`${styles.btn} ${styles.danger}`}
                            onClick={() => eliminarBoton(index)}
                        >
                            <i className="bi bi-x-circle" /> Eliminar
                        </button>
                    )}
                </div>
            </Accordion.Body>
        </Accordion.Item>
    );
}
