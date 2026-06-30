import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import styles from "./ConfigurarLeads.module.css";

export default function ConfigurarLeads() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [multilinkUrl, setMultilinkUrl] = useState("");

    const [formData, setFormData] = useState({
        formulario_activado: false,
        formulario_campos: [],
        formulario_titulo: "Contáctanos",
        formulario_subtitulo: "Déjanos tu información y te responderemos a la brevedad.",
        formulario_bg_color: "#010101",
        formulario_text_color: "#ffffff",
        formulario_btn_color: "#3aacd6",
        formulario_mensaje_agradecimiento: "Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.",
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
                        formulario_activado: data.formulario_activado || false,
                        formulario_campos: data.formulario_campos || [],
                        formulario_titulo: data.formulario_titulo || "Contáctanos",
                        formulario_subtitulo: data.formulario_subtitulo || "Déjanos tu información y te responderemos a la brevedad.",
                        formulario_bg_color: data.formulario_bg_color || "#010101",
                        formulario_text_color: data.formulario_text_color || "#ffffff",
                        formulario_btn_color: data.formulario_btn_color || "#3aacd6",
                        formulario_mensaje_agradecimiento: data.formulario_mensaje_agradecimiento || "Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.",
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
                formulario_activado: formData.formulario_activado,
                formulario_campos: formData.formulario_campos,
                formulario_titulo: formData.formulario_titulo,
                formulario_subtitulo: formData.formulario_subtitulo,
                formulario_bg_color: formData.formulario_bg_color,
                formulario_text_color: formData.formulario_text_color,
                formulario_btn_color: formData.formulario_btn_color,
                formulario_mensaje_agradecimiento: formData.formulario_mensaje_agradecimiento,
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
            formulario_campos: [
                ...prev.formulario_campos,
                { nombre: `campo_${Date.now()}`, label: "Nuevo Campo", tipo: "text", requerido: false, opciones: "" },
            ],
        }));
    };

    const deleteCampo = (index) => {
        setFormData((prev) => ({
            ...prev,
            formulario_campos: prev.formulario_campos.filter((_, i) => i !== index),
        }));
    };

    const updateCampo = (index, field, value) => {
        setFormData((prev) => {
            const nuevos = [...prev.formulario_campos];
            nuevos[index][field] = value;
            return { ...prev, formulario_campos: nuevos };
        });
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;

    return (
        <div className={styles.root}>
            <div className={styles.container}>
                <div className={styles.mainColumn}>
                    <div className={styles.header}>
                        <button className={styles.btnBack} onClick={() => navigate("/mis-multilinks")}>
                            <i className="bi bi-arrow-left"></i> Volver
                        </button>
                        <h1 className={styles.title}>Captura de Leads</h1>
                        <div className={styles.subtitle}>
                            Configura el formulario público para: <strong>{multilinkUrl}.gibracompany.com</strong>
                        </div>
                    </div>

                    <div className={styles.card}>
                        <div className={styles.switchRow}>
                            <div>
                                <div className={styles.cardTitle}>Habilitar Formulario</div>
                                <div className={styles.cardSubtitle}>Muestra el formulario en tu Multilink.</div>
                            </div>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    name="formulario_activado"
                                    checked={formData.formulario_activado}
                                    onChange={handleChange}
                                />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>

                    {formData.formulario_activado && (
                        <>
                            <div className={styles.card}>
                                <div className={styles.cardTitle}>Campos del Formulario</div>
                                <div className={styles.cardSubtitle}>Agrega, elimina y reordena los campos que tus clientes llenarán.</div>

                                <div className={styles.fieldsList}>
                                    {formData.formulario_campos.map((campo, i) => (
                                        <div key={i} className={styles.fieldItem}>
                                            <div className={styles.fieldRow}>
                                                <div className={styles.fieldGroup}>
                                                    <label>Etiqueta</label>
                                                    <input
                                                        className={styles.input}
                                                        value={campo.label}
                                                        onChange={(e) => updateCampo(i, "label", e.target.value)}
                                                        placeholder="Ej: Nombre completo"
                                                    />
                                                </div>
                                                <div className={styles.fieldGroup}>
                                                    <label>Tipo de campo</label>
                                                    <select
                                                        className={styles.input}
                                                        value={campo.tipo}
                                                        onChange={(e) => updateCampo(i, "tipo", e.target.value)}
                                                    >
                                                        <option value="text">Texto corto</option>
                                                        <option value="email">Correo electrónico</option>
                                                        <option value="tel">Teléfono</option>
                                                        <option value="textarea">Párrafo grande</option>
                                                        <option value="checkbox">Casilla de verificación</option>
                                                        <option value="select">Lista desplegable</option>
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
                                            {campo.tipo === "select" && (
                                                <div className={styles.fieldRowSub}>
                                                    <div className={styles.fieldGroup} style={{ flex: 1 }}>
                                                        <label>Opciones (separadas por coma)</label>
                                                        <input
                                                            className={styles.input}
                                                            value={campo.opciones || ""}
                                                            onChange={(e) => updateCampo(i, "opciones", e.target.value)}
                                                            placeholder="Ej: Servicio A, Servicio B, Servicio C"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className={styles.btnAdd} onClick={addCampo}>
                                    <i className="bi bi-plus-lg"></i> Agregar Nuevo Campo
                                </button>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardTitle}>Textos y Mensajes</div>
                                <div className={styles.cardSubtitle}>Personaliza los textos principales del formulario.</div>

                                <div className={styles.fieldGroup} style={{ marginBottom: '15px' }}>
                                    <label>Título del Formulario</label>
                                    <input
                                        className={styles.input}
                                        name="formulario_titulo"
                                        value={formData.formulario_titulo}
                                        onChange={handleChange}
                                        placeholder="Ej: Contáctanos"
                                    />
                                </div>
                                <div className={styles.fieldGroup} style={{ marginBottom: '15px' }}>
                                    <label>Subtítulo / Instrucciones</label>
                                    <textarea
                                        className={styles.textarea}
                                        name="formulario_subtitulo"
                                        value={formData.formulario_subtitulo}
                                        onChange={handleChange}
                                        placeholder="Déjanos tu información..."
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label>Mensaje de Agradecimiento</label>
                                    <textarea
                                        className={styles.textarea}
                                        name="formulario_mensaje_agradecimiento"
                                        value={formData.formulario_mensaje_agradecimiento}
                                        onChange={handleChange}
                                        placeholder="Texto a mostrar después de enviar..."
                                        rows="2"
                                    ></textarea>
                                </div>
                            </div>

                            <div className={styles.card}>
                                <div className={styles.cardTitle}>Diseño y Colores</div>
                                <div className={styles.cardSubtitle}>Personaliza cómo se verá el formulario públicamente.</div>

                                <div className={styles.designRow}>
                                    <div className={styles.fieldGroup}>
                                        <label>Color de Fondo</label>
                                        <input
                                            type="color"
                                            name="formulario_bg_color"
                                            value={formData.formulario_bg_color}
                                            onChange={handleChange}
                                            className={styles.colorInput}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label>Color del Texto</label>
                                        <input
                                            type="color"
                                            name="formulario_text_color"
                                            value={formData.formulario_text_color}
                                            onChange={handleChange}
                                            className={styles.colorInput}
                                        />
                                    </div>
                                    <div className={styles.fieldGroup}>
                                        <label>Color del Botón</label>
                                        <input
                                            type="color"
                                            name="formulario_btn_color"
                                            value={formData.formulario_btn_color}
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
                            {formData.formulario_activado ? (
                                <div className={styles.previewFormRoot} style={{ backgroundColor: formData.formulario_bg_color, color: formData.formulario_text_color }}>
                                    <div className={styles.previewFormCard} style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                        <div className={styles.previewFormTitle}>{formData.formulario_titulo || "Contáctanos"}</div>
                                        <div className={styles.previewFormSubtitle} style={{ opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                                            {formData.formulario_subtitulo}
                                        </div>
                                        
                                        {formData.formulario_campos.length === 0 ? (
                                            <div style={{opacity: 0.5, fontSize: '13px', fontStyle: 'italic'}}>Agrega campos para verlos aquí...</div>
                                        ) : (
                                            formData.formulario_campos.map((c, i) => (
                                                <div key={i} className={styles.previewFormField}>
                                                    {c.tipo !== 'checkbox' && (
                                                        <label className={styles.previewFormLabel}>{c.label}</label>
                                                    )}
                                                    {c.tipo === 'textarea' ? (
                                                        <textarea className={styles.previewFormInput} rows="2" placeholder="..." style={{ color: formData.formulario_text_color, borderColor: 'rgba(255,255,255,0.3)' }} disabled></textarea>
                                                    ) : c.tipo === 'checkbox' ? (
                                                        <label style={{ display: 'flex', gap: '8px', fontSize: '14px', alignItems: 'center' }}>
                                                            <input type="checkbox" disabled /> {c.label}
                                                        </label>
                                                    ) : c.tipo === 'select' ? (
                                                        <select className={styles.previewFormInput} style={{ color: formData.formulario_text_color, borderColor: 'rgba(255,255,255,0.3)' }} disabled>
                                                            <option>Selecciona una opción</option>
                                                        </select>
                                                    ) : (
                                                        <input className={styles.previewFormInput} placeholder="..." style={{ color: formData.formulario_text_color, borderColor: 'rgba(255,255,255,0.3)' }} disabled />
                                                    )}
                                                </div>
                                            ))
                                        )}
                                        
                                        <button 
                                            className={styles.previewFormBtn}
                                            style={{ backgroundColor: formData.formulario_btn_color, color: '#010101' }}
                                            disabled
                                        >
                                            Enviar mensaje
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', backgroundColor: '#111'}}>
                                    Formulario desactivado
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
