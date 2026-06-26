import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // ⬅️ usa navigate
import VistaPrevia from "../vistaPrevia/vistaPrevia.jsx";
import EditorBotones from "../../components/editorBotones/editorBotones.jsx";
import SubirImagen from "../../components/subirImagenes/subirImagen.jsx";
import { cargarMultilinkDesdeFirebase } from "../../services/cargarMultilinkDesdeFirebase.js";
import { guardarMultilinkEnFirebase } from "../../services/guardarMultilinkEnFirebase.js";
import { generarMultilink } from "../../services/api.js";
import styles from "./Formulario.module.css";

function Formulario() {
    const navigate = useNavigate();
    const { id } = useParams();

    const FUENTES = [
        "Arial",
        "Georgia",
        "Times New Roman",
        "Roboto",
        "Open Sans",
        "Lato",
        "Montserrat",
        "Playfair Display",
        "Source Sans Pro",
        "Poppins",
        "Nunito",
    ];

    const [formData, setFormData] = useState({
        titulo_pagina: "",
        titulo: "",
        subtitulo: "",
        borde: "",
        telefono: "",
        correo: "",
        plantilla: "plantilla_comercial",
        fondo: "",
        imagen_fondo: "",
        imagen: "",
        tamano_foto: "",
        color_titulo: "",
        tamano_titulo: "",
        mt_titulo: "",
        mb_titulo: "",
        color_subtitulo: "",
        tamano_subtitulo: "",
        mt_subtitulo: "",
        mb_subtitulo: "",
        color_footer: "",
        mostrar_boton_contacto: true,
        contacto_bg: "",
        contacto_color: "",
        contacto_borde_color: "",
        contacto_borde_grosor: "",
        nombre: "",
        nota: "",
        fuente_titulo: "Arial",
        fuente_subtitulo: "Arial",
        fuente_general: "Arial",
        botones: [
            {
                url: "",
                texto: "",
                icono: "",
                bg_color: "",
                text_color: "",
                icon_color: "",
                borde_color: "",
                borde_grosor: "",
            },
        ],
    });

    // ---- control de cambios sin guardar
    const [lastSaved, setLastSaved] = useState(null);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const pendingNavRef = useRef(null); // guarda la acción de navegación pendiente

    const snapshot = useMemo(() => JSON.stringify(formData), [formData]);
    const isDirty = useMemo(() => {
        if (lastSaved === null) return false; // aún no hemos “guardado” nada
        return snapshot !== lastSaved;
    }, [snapshot, lastSaved]);

    useEffect(() => {
        if (!id) return;
        cargarMultilinkDesdeFirebase(id)
            .then((data) => {
                if (!data) {
                    console.warn("Multilink no encontrado");
                    return;
                }
                const yaTieneFormulario = data.botones?.some((b) => b.tipo === "ResFormulario");
                const nuevosBotones = [...(data.botones || [])];

                if (data.formulario_activado && !yaTieneFormulario) {
                    nuevosBotones.push({
                        url: `https://multilinks-creator.gibracompany.com/formulario/${id}`,
                        texto: "Formulario",
                        icono: "bi-ui-checks",
                        bg_color: "#000000",
                        text_color: "#ffffff",
                        icon_color: "#ffffff",
                        fijo: true,
                        tipo: "ResFormulario",
                    });
                }

                const next = { ...data, botones: nuevosBotones };
                setFormData(next);
                // establecemos el snapshot “guardado” al cargar
                setLastSaved(JSON.stringify(next));
            })
            .catch((err) => {
                console.error("Error cargando multilink:", err);
            });
    }, [id]);

    // advertir si el usuario intenta cerrar/recargar con cambios pendientes
    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = ""; // necesario para que algunos navegadores muestren el diálogo
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const guardarYGenerar = async () => {
        try {
            await guardarMultilinkEnFirebase(id, formData);
            await generarMultilink(formData);
            setLastSaved(JSON.stringify(formData)); // ⬅️ ahora ya no está “dirty”
            alert("Multilink actualizado correctamente.");
        } catch (error) {
            console.error("Error al guardar y generar:", error);
            alert("Error al guardar o generar el multilink.");
        }
    };

    // ---- navegación segura atrás
    const goBackNow = () => navigate(-1);

    const handleBackClick = () => {
        if (isDirty) {
            pendingNavRef.current = goBackNow;
            setShowLeaveConfirm(true);
        } else {
            goBackNow();
        }
    };

    const confirmLeave = () => {
        setShowLeaveConfirm(false);
        const fn = pendingNavRef.current;
        pendingNavRef.current = null;
        if (fn) fn();
    };

    const cancelLeave = () => {
        setShowLeaveConfirm(false);
        pendingNavRef.current = null;
    };

    return (
        <div className={styles.root}>
            {/* Toolbar superior con botón Atrás y acciones rápidas */}
            <div className={styles.toolbar}>
                <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={handleBackClick}>
                    <i className="bi bi-arrow-left"></i> Atrás
                </button>

                <div className={styles.toolbarRight}>
                    {isDirty && <span className={styles.badgeDirty}>Cambios sin guardar</span>}
                    <button type="button" className={styles.btn} onClick={guardarYGenerar}>
                        <i className="bi bi-save2" /> Guardar
                    </button>
                    {/*
                    <button
                        type="button"
                        className={`${styles.btn} ${styles.outline}`}
                        onClick={() => console.log(JSON.stringify(formData, null, 2))}
                    >
                        <i className="bi bi-braces" /> Imprimir JSON
                    </button>
                    */}
                </div>
            </div>

            <div className="container-fluid py-4">
                <div className="row g-4">
                    {/* Columna izquierda */}
                    <div className="col-lg-4">
                        <div className={`${styles.card} shadow-sm`}>
                            <h3 className={styles.h3}>Personalización del Multilink</h3>

                            <div className="mb-3">
                                <label className={styles.label}>Título de la página</label>
                                <input
                                    className={styles.input}
                                    name="titulo_pagina"
                                    value={formData.titulo_pagina}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className={styles.label}>Diseño de Plantilla</label>
                                <select
                                    className={styles.input}
                                    name="plantilla"
                                    value={formData.plantilla || "plantilla_comercial"}
                                    onChange={handleChange}
                                >
                                    <option value="plantilla_comercial">Comercial (Clásica)</option>
                                    <option value="plantilla_minimalista">Minimalista</option>
                                    <option value="plantilla_oscura">Oscura Neón</option>
                                    <option value="plantilla_glassmorphism">Glassmorphism (Cristal)</option>
                                </select>
                            </div>

                            <hr className={styles.hr} />

                            <div className="mb-3">
                                <h4 className={styles.h4}>Título</h4>
                                <input
                                    className={styles.input}
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="row g-3">
                                <div className="col-3">
                                    <label className={styles.label}>Color</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="color_titulo"
                                        value={formData.color_titulo || "#000000"}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Tamaño</label>
                                    <input
                                        type="number"
                                        name="tamano_titulo"
                                        className={styles.input}
                                        min="0"
                                        value={parseInt(formData.tamano_titulo) || 0}
                                        onChange={(e) => setFormData({ ...formData, tamano_titulo: `${e.target.value}px` })}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Margen Superior</label>
                                    <input
                                        type="number"
                                        name="mt_titulo"
                                        className={styles.input}
                                        value={parseInt(formData.mt_titulo) || 0}
                                        onChange={(e) => setFormData({ ...formData, mt_titulo: `${e.target.value}px` })}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Margen Inferior</label>
                                    <input
                                        type="number"
                                        name="mb_titulo"
                                        className={styles.input}
                                        value={parseInt(formData.mb_titulo) || 0}
                                        onChange={(e) => setFormData({ ...formData, mb_titulo: `${e.target.value}px` })}
                                    />
                                </div>
                            </div>

                            <hr className={styles.hr} />

                            <div className="mb-3">
                                <h4 className={styles.h4}>Subtítulo</h4>
                                <input
                                    className={styles.input}
                                    name="subtitulo"
                                    value={formData.subtitulo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="row g-3">
                                <div className="col-3">
                                    <label className={styles.label}>Color</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="color_subtitulo"
                                        value={formData.color_subtitulo || "#000000"}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Tamaño</label>
                                    <input
                                        type="number"
                                        name="tamano_subtitulo"
                                        className={styles.input}
                                        min="0"
                                        value={parseInt(formData.tamano_subtitulo) || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, tamano_subtitulo: `${e.target.value}px` })
                                        }
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Margen Inferior</label>
                                    <input
                                        type="number"
                                        name="mb_subtitulo"
                                        className={styles.input}
                                        value={parseInt(formData.mb_subtitulo) || 0}
                                        onChange={(e) => setFormData({ ...formData, mb_subtitulo: `${e.target.value}px` })}
                                    />
                                </div>
                            </div>

                            <hr className={styles.hr} />

                            <div className="row g-3">
                                <div className="col">
                                    <label className={styles.label}>Color del fondo</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="fondo"
                                        value={formData.fondo || "#ffffff"}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Color del Footer</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="color_footer"
                                        value={formData.color_footer || "#000000"}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="mt-3">
                                <label className={styles.label}>O subir imagen de fondo</label>
                                <SubirImagen
                                    urlInicial={formData.imagen_fondo}
                                    onUploadSuccess={(url) => setFormData({ ...formData, imagen_fondo: url })}
                                />
                            </div>

                            <hr className={styles.hr} />

                            <div className="mb-3">
                                <h4 className={styles.h4}>Tipografía</h4>

                                <div className="mb-3">
                                    <label className={styles.label}>Fuente del Título</label>
                                    <div className={styles.selectWrap}>
                                        <select
                                            className={`${styles.input} ${styles.select}`}
                                            name="fuente_titulo"
                                            value={formData.fuente_titulo}
                                            onChange={handleChange}
                                        >
                                            {/* Si quieres permitir heredar por defecto, habilita esta opción */}
                                            {/* <option value="">Por defecto (heredar)</option> */}
                                            {FUENTES.map((f) => (
                                                <option key={f} value={f} style={{ fontFamily: f }}>
                                                    {f}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={styles.caret} aria-hidden>▾</span>
                                    </div>

                                    <div
                                        className={styles.fontPreview}
                                        style={{ fontFamily: formData.fuente_titulo || "inherit" }}
                                        aria-label="Vista previa fuente título"
                                    >
                                        Aa Bb Cc — Título de ejemplo
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className={styles.label}>Fuente del Subtítulo</label>
                                    <div className={styles.selectWrap}>
                                        <select
                                            className={`${styles.input} ${styles.select}`}
                                            name="fuente_subtitulo"
                                            value={formData.fuente_subtitulo}
                                            onChange={handleChange}
                                        >
                                            {/* <option value="">Por defecto (heredar)</option> */}
                                            {FUENTES.map((f) => (
                                                <option key={f} value={f} style={{ fontFamily: f }}>
                                                    {f}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={styles.caret} aria-hidden>▾</span>
                                    </div>

                                    <div
                                        className={styles.fontPreview}
                                        style={{ fontFamily: formData.fuente_subtitulo || "inherit" }}
                                        aria-label="Vista previa fuente subtítulo"
                                    >
                                        Aa Bb Cc — Subtítulo de ejemplo
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className={styles.label}>Fuente General</label>
                                    <div className={styles.selectWrap}>
                                        <select
                                            className={`${styles.input} ${styles.select}`}
                                            name="fuente_general"
                                            value={formData.fuente_general}
                                            onChange={handleChange}
                                        >
                                            {/* <option value="">Por defecto (heredar)</option> */}
                                            {FUENTES.map((f) => (
                                                <option key={f} value={f} style={{ fontFamily: f }}>
                                                    {f}
                                                </option>
                                            ))}
                                        </select>
                                        <span className={styles.caret} aria-hidden>▾</span>
                                    </div>

                                    <div
                                        className={styles.fontPreview}
                                        style={{ fontFamily: formData.fuente_general || "inherit" }}
                                        aria-label="Vista previa fuente general"
                                    >
                                        Aa Bb Cc — Texto de ejemplo
                                    </div>
                                </div>
                            </div>

                            <hr className={styles.hr} />

                            <div className="mb-2">
                                <h4 className={styles.h4}>Subir imagen</h4>
                                <SubirImagen
                                    urlInicial={formData.imagen}
                                    onUploadSuccess={(url) => setFormData({ ...formData, imagen: url })}
                                />
                            </div>

                            <div className="row g-3">
                                <div className="col">
                                    <label className={styles.label}>Tamaño imagen</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        name="tamano_foto"
                                        min="0"
                                        value={parseInt(formData.tamano_foto) || 0}
                                        onChange={(e) => setFormData({ ...formData, tamano_foto: `${e.target.value}px` })}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Borde (%)</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        name="borde"
                                        min="0"
                                        max="50"
                                        value={parseInt(formData.borde) || 0}
                                        onChange={(e) => {
                                            const value = Math.min(50, Math.max(0, parseInt(e.target.value) || 0));
                                            setFormData({ ...formData, borde: `${value}%` });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={`${styles.card} shadow-sm`}>
                            <h3 className={styles.h3}>Información de contacto</h3>

                            <div className="form-check form-switch mb-3">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    name="mostrar_boton_contacto"
                                    id="mostrar_boton_contacto"
                                    checked={formData.mostrar_boton_contacto}
                                    onChange={handleChange}
                                />
                                <label className="form-check-label" htmlFor="mostrar_boton_contacto">
                                    Mostrar botón de contacto
                                </label>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col">
                                    <label className={styles.label}>Color del fondo</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="contacto_bg"
                                        value={formData.contacto_bg || "#000000"}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Color del texto</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="contacto_color"
                                        value={formData.contacto_color || "#ffffff"}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Color del borde</label>
                                    <input
                                        type="color"
                                        className={styles.color}
                                        name="contacto_borde_color"
                                        value={formData.contacto_borde_color || "#000000"}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col">
                                    <label className={styles.label}>Grosor del borde (px)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="15"
                                        className={styles.input}
                                        name="contacto_borde_grosor"
                                        value={formData.contacto_borde_grosor || 0}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className={styles.label}>Nombre</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className={styles.label}>Nota</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    name="nota"
                                    value={formData.nota}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-3">
                                <label className={styles.label}>Teléfono</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-1">
                                <label className={styles.label}>Correo</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Columna centro-derecha */}
                    <div className="col-lg-4">
                        <div className={`${styles.card} shadow-sm`}>
                            <div className="mt-2">
                                <EditorBotones
                                    botones={formData.botones}
                                    setBotones={(nuevosBotones) => setFormData({ ...formData, botones: nuevosBotones })}
                                />
                            </div>
                        </div>

                        {formData.formulario_activado && (
                            <div className={`${styles.card} shadow-sm`}>
                                <h4 className={styles.h4}>Campos del Formulario</h4>

                                {formData.formulario_campos?.map((campo, idx) => (
                                    <div key={idx} className={styles.fieldrow}>
                                        <input
                                            className={styles.input}
                                            placeholder="Etiqueta"
                                            value={campo.label}
                                            onChange={(e) => {
                                                const nuevos = [...formData.formulario_campos];
                                                nuevos[idx].label = e.target.value;
                                                setFormData({ ...formData, formulario_campos: nuevos });
                                            }}
                                        />

                                        <select
                                            className={styles.input}
                                            value={campo.tipo}
                                            onChange={(e) => {
                                                const nuevos = [...formData.formulario_campos];
                                                nuevos[idx].tipo = e.target.value;
                                                setFormData({ ...formData, formulario_campos: nuevos });
                                            }}
                                        >
                                            <option value="text">Texto</option>
                                            <option value="email">Email</option>
                                            <option value="tel">Teléfono</option>
                                            <option value="textarea">Área de texto</option>
                                        </select>

                                        <label className={styles.check}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={campo.requerido}
                                                onChange={(e) => {
                                                    const nuevos = [...formData.formulario_campos];
                                                    nuevos[idx].requerido = e.target.checked;
                                                    setFormData({ ...formData, formulario_campos: nuevos });
                                                }}
                                            />
                                            <span>Requerido</span>
                                        </label>

                                        <button
                                            className={`${styles.btn} ${styles.danger} ${styles.del}`}
                                            onClick={() => {
                                                const nuevos = formData.formulario_campos.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, formulario_campos: nuevos });
                                            }}
                                            type="button"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className={`${styles.btn} ${styles.outline} mt-2`}
                                    onClick={() => {
                                        const nuevos = formData.formulario_campos ? [...formData.formulario_campos] : [];
                                        nuevos.push({
                                            nombre: `campo${nuevos.length + 1}`,
                                            label: "",
                                            tipo: "text",
                                            requerido: false,
                                        });
                                        setFormData({ ...formData, formulario_campos: nuevos });
                                    }}
                                    type="button"
                                >
                                    Agregar campo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Columna vista previa (sticky y centrada) */}
                    <div className="col-lg-4">
                        <div className={styles.previewWrap}>
                            <div className={styles.phone}>
                                <div className={styles.notch} />
                                {/* 👇 pantalla con padding y borde propio */}
                                <div>
                                    <VistaPrevia data={formData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación al salir */}
            {showLeaveConfirm && (
                <div className={styles.confirmOverlay} role="dialog" aria-modal="true">
                    <div className={styles.confirmModal}>
                        <h4>¿Salir sin guardar?</h4>
                        <p>Tienes cambios sin guardar. Si sales ahora, se perderán.</p>
                        <div className={styles.actions}>
                            <button className={`${styles.btn} ${styles.outline}`} onClick={cancelLeave} type="button">
                                Cancelar
                            </button>
                            <button className={styles.btn} onClick={confirmLeave} type="button">
                                Salir de todos modos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Formulario;
