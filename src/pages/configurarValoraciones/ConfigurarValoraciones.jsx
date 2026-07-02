import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import styles from "./ConfigurarValoraciones.module.css";

const getContrastColor = (hexColor) => {
    if (!hexColor) return '#ffffff';
    const hex = hexColor.replace('#', '');
    if (hex.length !== 6 && hex.length !== 3) return '#ffffff';
    const r = parseInt(hex.length === 3 ? hex[0]+hex[0] : hex.substring(0, 2), 16);
    const g = parseInt(hex.length === 3 ? hex[1]+hex[1] : hex.substring(2, 4), 16);
    const b = parseInt(hex.length === 3 ? hex[2]+hex[2] : hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default function ConfigurarValoraciones() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [multilinkUrl, setMultilinkUrl] = useState("");

    const [formData, setFormData] = useState({
        valoracion_activada: false,
        valoracion_campos: [],
        valoracion_titulo: "¿Qué tal tu experiencia?",
        valoracion_subtitulo: "Déjanos tu valoración y ayúdanos a mejorar.",
        valoracion_bg_color: "#1a1a1a",
        valoracion_btn_color: "#ffc107",
        valoracion_mensaje_agradecimiento: "¡Gracias por tu valoración!",
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const docRef = doc(db, "multilinks", id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setMultilinkUrl(data.url);
                    setFormData({
                        valoracion_activada: data.valoracion_activada || false,
                        valoracion_campos: data.valoracion_campos || [
                            { nombre: "estrellas_1", label: "Calificación", tipo: "stars", requerido: true },
                            { nombre: "comentario_1", label: "Comentario", tipo: "textarea", requerido: false }
                        ],
                        valoracion_titulo: data.valoracion_titulo || "¿Qué tal tu experiencia?",
                        valoracion_subtitulo: data.valoracion_subtitulo || "Déjanos tu valoración y ayúdanos a mejorar.",
                        valoracion_bg_color: data.valoracion_bg_color || "#1a1a1a",
                        valoracion_btn_color: data.valoracion_btn_color || "#ffc107",
                        valoracion_mensaje_agradecimiento: data.valoracion_mensaje_agradecimiento || "¡Gracias por tu valoración!",
                    });
                } else {
                    toast.error("Multilink no encontrado");
                    navigate("/mis-multilinks");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error al cargar los datos.");
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleGuardar = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, "multilinks", id);
            await updateDoc(docRef, {
                valoracion_activada: formData.valoracion_activada,
                valoracion_campos: formData.valoracion_campos,
                valoracion_titulo: formData.valoracion_titulo,
                valoracion_subtitulo: formData.valoracion_subtitulo,
                valoracion_bg_color: formData.valoracion_bg_color,
                valoracion_btn_color: formData.valoracion_btn_color,
                valoracion_mensaje_agradecimiento: formData.valoracion_mensaje_agradecimiento,
            });
            toast.success("Configuración guardada correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar la configuración");
        } finally {
            setSaving(false);
        }
    };

    const addCampo = () => {
        setFormData((prev) => ({
            ...prev,
            valoracion_campos: [
                ...prev.valoracion_campos,
                { nombre: `campo_${Date.now()}`, label: "Nuevo Campo", tipo: "stars", requerido: false },
            ],
        }));
    };

    const deleteCampo = (index) => {
        setFormData((prev) => ({
            ...prev,
            valoracion_campos: prev.valoracion_campos.filter((_, i) => i !== index),
        }));
    };

    const updateCampo = (index, field, value) => {
        setFormData((prev) => {
            const nuevos = [...prev.valoracion_campos];
            nuevos[index][field] = value;
            return { ...prev, valoracion_campos: nuevos };
        });
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;

    const autoTextColor = getContrastColor(formData.valoracion_bg_color);
    const autoBtnTextColor = getContrastColor(formData.valoracion_btn_color);
    const autoBorderColor = autoTextColor === '#000000' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    const autoBorderColorLight = autoTextColor === '#000000' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)';

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <div className={styles.mainColumn}>
                    <div className={styles.header}>
                        <button className={styles.btnBack} onClick={() => navigate("/mis-multilinks")}>
                            <i className="bi bi-arrow-left"></i> Volver
                        </button>
                        <h1 className={styles.title}>Sistema de Valoraciones</h1>
                        <div className={styles.subtitle}>
                            Configura la pantalla de reseñas para: <strong>{multilinkUrl}.gibracompany.com</strong>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.switchRow}>
                            <div>
                                <div className={styles.cardTitle}>Habilitar Valoraciones</div>
                                <div className={styles.cardSubtitle}>Permite a tus clientes calificar su experiencia.</div>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    name="valoracion_activada"
                                    checked={formData.valoracion_activada}
                                    onChange={handleChange}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    {formData.valoracion_activada && (
                        <>
                            <div className={styles.card}>
                                <div className={styles.cardTitle}>Campos Dinámicos</div>
                                <div className={styles.cardSubtitle}>Agrega y elige qué pedirle a tus clientes (estrellas o texto).</div>

                                <div className={styles.fieldsList}>
                                    {formData.valoracion_campos.map((campo, i) => (
                                        <div key={i} className={styles.fieldItem}>
                                            <div className={styles.fieldRow}>
                                                <div className={styles.fieldGroup}>
                                                    <label>Pregunta / Etiqueta</label>
                                                    <input
                                                        className={styles.input}
                                                        value={campo.label}
                                                        onChange={(e) => updateCampo(i, "label", e.target.value)}
                                                        placeholder="Ej: Califica nuestro servicio"
                                                    />
                                                </div>
                                                <div className={styles.fieldGroup}>
                                                    <label>Tipo de campo</label>
                                                    <select
                                                        className={styles.input}
                                                        value={campo.tipo}
                                                        onChange={(e) => updateCampo(i, "tipo", e.target.value)}
                                                    >
                                                        <option value="stars">Estrellas (1 a 5)</option>
                                                        <option value="text">Texto corto</option>
                                                        <option value="textarea">Texto largo (Comentario)</option>
                                                    </select>
                                                </div>
                                                <div className={styles.fieldGroupAuto}>
                                                    <label>Requerido</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={campo.requerido}
                                                        onChange={(e) => updateCampo(i, "requerido", e.target.checked)}
                                                        className={styles.checkInput}
                                                    />
                                                </div>
                                                <div className={styles.fieldGroupAuto}>
                                                    <label>&nbsp;</label>
                                                    <button
                                                        className={styles.btnDanger}
                                                        onClick={() => deleteCampo(i)}
                                                        title="Eliminar campo"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className={styles.btnAdd} onClick={addCampo}>
                                    <i className="bi bi-plus-lg"></i> Agregar Pregunta
                                </button>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardTitle}>Textos y Mensajes</div>
                                <div className={styles.cardSubtitle}>Personaliza los textos principales de la pantalla.</div>

                                <div className={styles.fieldGroup} style={{ marginBottom: '15px' }}>
                                    <label>Título Principal</label>
                                    <input
                                        className={styles.input}
                                        name="valoracion_titulo"
                                        value={formData.valoracion_titulo}
                                        onChange={handleChange}
                                        placeholder="Ej: ¿Qué tal tu experiencia?"
                                    />
                                </div>
                                <div className={styles.fieldGroup} style={{ marginBottom: '15px' }}>
                                    <label>Subtítulo / Instrucciones</label>
                                    <textarea
                                        className={styles.textarea}
                                        name="valoracion_subtitulo"
                                        value={formData.valoracion_subtitulo}
                                        onChange={handleChange}
                                        placeholder="Déjanos tu valoración..."
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Mensaje de Agradecimiento</label>
                                    <textarea
                                        className={styles.textarea}
                                        name="valoracion_mensaje_agradecimiento"
                                        value={formData.valoracion_mensaje_agradecimiento}
                                        onChange={handleChange}
                                        placeholder="Texto a mostrar después de calificar..."
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardTitle}>Diseño y Colores</div>
                                <div className={styles.cardSubtitle}>Personaliza cómo se verá la pantalla de valoraciones.</div>

                                <div className={styles.designRow}>
                                    <div className={styles.fieldGroup}>
                                        <label>Color de Fondo</label>
                                        <input
                                            type="color"
                                            name="valoracion_bg_color"
                                            value={formData.valoracion_bg_color}
                                            onChange={handleChange}
                                            className={styles.colorInput}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label>Color del Botón</label>
                                        <input
                                            type="color"
                                            name="valoracion_btn_color"
                                            value={formData.valoracion_btn_color}
                                            onChange={handleChange}
                                            className={styles.colorInput}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className={styles.footerRow}>
                        <button className={styles.btnSave} onClick={handleGuardar} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar Configuración"}
                        </button>
                    </div>
                </div>

                {/* Vista Previa del Mockup */}
                <div className={styles.previewColumn}>
                    <div className={styles.phone}>
                        <div className={styles.statusBar}>
                            <span className={styles.statusTime}>9:41</span>
                            <div className={styles.statusIcons}>
                                <i className="bi bi-bar-chart-fill"></i>
                                <i className="bi bi-wifi"></i>
                                <i className="bi bi-battery-full"></i>
                            </div>
                        </div>
                        <div className={styles.notch} />
                        <div className={styles.screenGlare} />
                        <div className={styles.homeBar} />
                        
                        <div className={styles.screen}>
                            {formData.valoracion_activada ? (
                                <div className={styles.previewFormRoot} style={{ backgroundColor: formData.valoracion_bg_color, color: autoTextColor }}>
                                    <div className={styles.previewFormCard} style={{ borderColor: autoBorderColorLight }}>
                                        <div className={styles.previewFormTitle}>{formData.valoracion_titulo || "Calificar"}</div>
                                        <div className={styles.previewFormSubtitle} style={{ opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                                            {formData.valoracion_subtitulo}
                                        </div>
                                        
                                        {formData.valoracion_campos.length === 0 ? (
                                            <div style={{opacity: 0.5, fontSize: '13px', fontStyle: 'italic'}}>Agrega campos para verlos aquí...</div>
                                        ) : (
                                            formData.valoracion_campos.map((c, i) => (
                                                <div key={i} className={styles.previewFormField}>
                                                    <label className={styles.previewFormLabel}>{c.label}</label>
                                                    {c.tipo === 'textarea' ? (
                                                        <textarea className={styles.previewFormInput} rows="2" placeholder="..." style={{ color: autoTextColor, borderColor: autoBorderColor }} disabled></textarea>
                                                    ) : c.tipo === 'stars' ? (
                                                        <div style={{ display: 'flex', gap: '5px', fontSize: '24px', color: '#ffc107', marginTop: '5px' }}>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star-fill"></i>
                                                            <i className="bi bi-star"></i>
                                                        </div>
                                                    ) : (
                                                        <input className={styles.previewFormInput} placeholder="..." style={{ color: autoTextColor, borderColor: autoBorderColor }} disabled />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                        
                                        <button 
                                            className={styles.previewFormBtn}
                                            style={{ backgroundColor: formData.valoracion_btn_color, color: autoBtnTextColor }}
                                            disabled
                                        >
                                            Enviar Valoración
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', backgroundColor: '#111'}}>
                                    Valoraciones desactivadas
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
