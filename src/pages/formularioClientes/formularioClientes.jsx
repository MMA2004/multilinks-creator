import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import styles from "./formularioClientes.module.css";

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

function FormularioCliente() {
    const { id } = useParams(); // este es el ID del multilink
    const [campos, setCampos] = useState([]);
    const [formData, setFormData] = useState({});
    const [enviado, setEnviado] = useState(false);
    const [multilinkUrl, setMultilinkUrl] = useState("");
    const [miembros, setMiembros] = useState([]);
    
    const [config, setConfig] = useState({
        titulo: "Contáctanos",
        subtitulo: "Déjanos tu información y te responderemos a la brevedad.",
        bgColor: "#010101",
        textColor: "#ffffff",
        btnColor: "#3aacd6",
        mensajeAgradecimiento: "Gracias por tu mensaje. Nos pondremos en contacto contigo pronto."
    });

    useEffect(() => {
        const cargarFormulario = async () => {
            try {
                const docRef = doc(db, "multilinks", id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    setCampos(data.formulario_campos || []);
                    setMultilinkUrl(data.url); 
                    setMiembros(data.miembros || []);
                    setConfig({
                        titulo: data.formulario_titulo || "Contáctanos",
                        subtitulo: data.formulario_subtitulo || "Déjanos tu información y te responderemos a la brevedad.",
                        bgColor: data.formulario_bg_color || "#010101",
                        textColor: data.formulario_text_color || "#ffffff",
                        btnColor: data.formulario_btn_color || "#3aacd6",
                        mensajeAgradecimiento: data.formulario_mensaje_agradecimiento || "Gracias por tu mensaje. Nos pondremos en contacto contigo pronto."
                    });
                }
            } catch (error) {
                console.error("Error al cargar configuración", error);
            }
        };
        cargarFormulario();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const respuestasEtiquetadas = {};
        campos.forEach((campo) => {
            respuestasEtiquetadas[campo.label] = formData[campo.nombre] !== undefined ? formData[campo.nombre] : "";
        });

        try {
            await addDoc(collection(db, "respuestas_formulario"), {
                multilink_url: multilinkUrl,
                miembros: miembros,
                respuestas: respuestasEtiquetadas,
                timestamp: new Date().toISOString()
            });
            toast.success("Enviado con éxito");
            setEnviado(true);
        } catch (err) {
            console.error(err);
            toast.error("Error al enviar el Formulario. Intenta de nuevo.");
        }
    };

    if (enviado) {
        const autoTextColor = getContrastColor(config.bgColor);
        return (
            <div className={styles.root} style={{ backgroundColor: config.bgColor }}>
                <div className={styles.card} style={{ color: autoTextColor, borderColor: autoTextColor === '#000000' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)' }}>
                    <div className={styles.successCard}>
                        <i className={`bi bi-check-circle-fill ${styles.successIcon}`} style={{ color: config.btnColor }}></i>
                        <div className={styles.successTitle}>¡Recibido!</div>
                        <div className={styles.successText} style={{ whiteSpace: 'pre-wrap' }}>
                            {config.mensajeAgradecimiento}
                        </div>
                    </div>
                    <div className={styles.footer} style={{ color: config.textColor, opacity: 0.8 }}>
                        Powered by{" "}
                        <a className={styles.anchor} href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{ color: autoTextColor }}>
                            Gibra Company
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const autoTextColor = getContrastColor(config.bgColor);
    const autoBtnTextColor = getContrastColor(config.btnColor);
    const autoBorderColor = autoTextColor === '#000000' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';

    return (
        <div className={styles.root} style={{ backgroundColor: config.bgColor }}>
            <div className={styles.card} style={{ color: autoTextColor }}>
                <div className={styles.title}>{config.titulo}</div>
                <div className={styles.subtitle} style={{ color: autoTextColor, opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                    {config.subtitulo}
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {campos.map((campo, i) => (
                        <div key={i} className={styles.field}>
                            {campo.tipo !== "checkbox" && (
                                <label className={styles.label} style={{ color: autoTextColor }}>{campo.label}</label>
                            )}

                            {campo.tipo === "textarea" ? (
                                <textarea
                                    className={styles.textarea}
                                    name={campo.nombre}
                                    required={campo.requerido}
                                    onChange={handleChange}
                                    placeholder={`Escribe tu ${campo.label.toLowerCase()}...`}
                                    style={{ color: autoTextColor, borderColor: autoBorderColor }}
                                />
                            ) : campo.tipo === "checkbox" ? (
                                <label className={styles.checkboxWrap}>
                                    <input
                                        className={styles.checkbox}
                                        type="checkbox"
                                        name={campo.nombre}
                                        onChange={handleChange}
                                        required={campo.requerido}
                                    />
                                    <span className={styles.checkboxLabel} style={{ color: autoTextColor }}>{campo.label}</span>
                                </label>
                            ) : campo.tipo === "select" ? (
                                <select
                                    className={styles.input}
                                    name={campo.nombre}
                                    onChange={handleChange}
                                    required={campo.requerido}
                                    style={{ color: autoTextColor, borderColor: autoBorderColor }}
                                >
                                    <option value="" style={{ color: '#000' }}>Selecciona una opción</option>
                                    {(campo.opciones || "").split(",").map(opt => opt.trim()).filter(Boolean).map((opcion, idx) => (
                                        <option key={idx} value={opcion} style={{ color: '#000' }}>{opcion}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    className={styles.input}
                                    type={campo.tipo}
                                    name={campo.nombre}
                                    onChange={handleChange}
                                    required={campo.requerido}
                                    placeholder={`Tu ${campo.label.toLowerCase()}`}
                                    style={{ color: autoTextColor, borderColor: autoBorderColor }}
                                />
                            )}
                        </div>
                    ))}
                    <button 
                        className={styles.btn} 
                        type="submit"
                        style={{ backgroundColor: config.btnColor, color: autoBtnTextColor, borderColor: config.btnColor }}
                    >
                        Enviar mensaje
                    </button>
                </form>

                <div className={styles.footer} style={{ color: autoTextColor, opacity: 0.8 }}>
                    Powered by{" "}
                    <a className={styles.anchor} href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{ color: autoTextColor }}>
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FormularioCliente;
