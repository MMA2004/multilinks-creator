import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import styles from "./ValoracionCliente.module.css";

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

// Componente interactivo de estrellas
const StarRating = ({ value, onChange, size = "32px", color = "#ffc107" }) => {
    const [hover, setHover] = useState(0);

    return (
        <div style={{ display: "flex", gap: "8px", cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <i
                    key={star}
                    className={`bi bi-star-fill`}
                    style={{
                        fontSize: size,
                        color: star <= (hover || value) ? color : "rgba(150, 150, 150, 0.3)",
                        transition: "color 0.2s",
                    }}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(star)}
                ></i>
            ))}
        </div>
    );
};

export default function ValoracionCliente() {
    const { id } = useParams();
    const [campos, setCampos] = useState([]);
    const [formData, setFormData] = useState({});
    const [enviado, setEnviado] = useState(false);
    const [multilinkUrl, setMultilinkUrl] = useState("");
    const [miembros, setMiembros] = useState([]);
    
    const [config, setConfig] = useState({
        titulo: "¿Qué tal tu experiencia?",
        subtitulo: "Déjanos tu valoración y ayúdanos a mejorar.",
        bgColor: "#1a1a1a",
        btnColor: "#ffc107",
        mensajeAgradecimiento: "¡Gracias por tu valoración!"
    });

    useEffect(() => {
        const cargarValoracion = async () => {
            try {
                const docRef = doc(db, "multilinks", id);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    if (!data.valoracion_activada) {
                        toast.error("Las valoraciones no están activadas para este enlace.");
                        return;
                    }
                    
                    setCampos(data.valoracion_campos || [
                        { nombre: "estrellas_1", label: "Calificación", tipo: "stars", requerido: true },
                        { nombre: "comentario_1", label: "Comentario", tipo: "textarea", requerido: false }
                    ]);
                    setMultilinkUrl(data.url); 
                    setMiembros(data.miembros || []);
                    setConfig({
                        titulo: data.valoracion_titulo || "¿Qué tal tu experiencia?",
                        subtitulo: data.valoracion_subtitulo || "Déjanos tu valoración y ayúdanos a mejorar.",
                        bgColor: data.valoracion_bg_color || "#1a1a1a",
                        btnColor: data.valoracion_btn_color || "#ffc107",
                        mensajeAgradecimiento: data.valoracion_mensaje_agradecimiento || "¡Gracias por tu valoración!"
                    });
                }
            } catch (error) {
                console.error("Error al cargar configuración", error);
            }
        };
        cargarValoracion();
    }, [id]);

    const handleChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación manual de campos requeridos (especial para estrellas)
        for (let campo of campos) {
            if (campo.requerido && !formData[campo.nombre]) {
                toast.error(`El campo "${campo.label}" es obligatorio.`);
                return;
            }
        }

        const respuestasEtiquetadas = {};
        campos.forEach((campo) => {
            respuestasEtiquetadas[campo.label] = formData[campo.nombre] !== undefined ? formData[campo.nombre] : "";
        });

        try {
            await addDoc(collection(db, "respuestas_valoracion"), {
                multilink_url: multilinkUrl,
                miembros: miembros,
                respuestas: respuestasEtiquetadas,
                timestamp: new Date().toISOString()
            });
            toast.success("Valoración enviada con éxito");
            setEnviado(true);
        } catch (err) {
            console.error(err);
            toast.error("Error al enviar la valoración. Intenta de nuevo.");
        }
    };

    const autoTextColor = getContrastColor(config.bgColor);
    const autoBtnTextColor = getContrastColor(config.btnColor);
    const autoBorderColor = autoTextColor === '#000000' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';

    if (enviado) {
        return (
            <div className={styles.root} style={{ backgroundColor: config.bgColor }}>
                <div className={styles.card} style={{ color: autoTextColor, borderColor: autoBorderColor }}>
                    <div className={styles.successCard}>
                        <i className={`bi bi-star-fill ${styles.successIcon}`} style={{ color: config.btnColor }}></i>
                        <div className={styles.successTitle}>¡Recibido!</div>
                        <div className={styles.successText} style={{ whiteSpace: 'pre-wrap' }}>
                            {config.mensajeAgradecimiento}
                        </div>
                    </div>
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

    return (
        <div className={styles.root} style={{ backgroundColor: config.bgColor }}>
            <div className={styles.card} style={{ color: autoTextColor, borderColor: autoBorderColor }}>
                <div className={styles.title}>{config.titulo}</div>
                <div className={styles.subtitle} style={{ color: autoTextColor, opacity: 0.8, whiteSpace: 'pre-wrap' }}>
                    {config.subtitulo}
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {campos.map((campo, i) => (
                        <div key={i} className={styles.field}>
                            <label className={styles.label} style={{ color: autoTextColor }}>
                                {campo.label} {campo.requerido && <span style={{ color: '#ef4444' }}>*</span>}
                            </label>

                            {campo.tipo === "textarea" ? (
                                <textarea
                                    className={styles.textarea}
                                    name={campo.nombre}
                                    onChange={(e) => handleChange(campo.nombre, e.target.value)}
                                    placeholder="..."
                                    style={{ color: autoTextColor, borderColor: autoBorderColor }}
                                />
                            ) : campo.tipo === "stars" ? (
                                <div className={styles.starsContainer}>
                                    <StarRating 
                                        value={formData[campo.nombre] || 0}
                                        onChange={(val) => handleChange(campo.nombre, val)}
                                        color={config.btnColor}
                                    />
                                </div>
                            ) : (
                                <input
                                    className={styles.input}
                                    type="text"
                                    name={campo.nombre}
                                    onChange={(e) => handleChange(campo.nombre, e.target.value)}
                                    placeholder="..."
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
                        Enviar Valoración
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
