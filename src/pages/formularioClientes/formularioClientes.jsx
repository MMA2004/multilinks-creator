import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import styles from "./formularioClientes.module.css";

function FormularioCliente() {
    const { id } = useParams(); // este es el ID del multilink
    const [campos, setCampos] = useState([]);
    const [formData, setFormData] = useState({});
    const [enviado, setEnviado] = useState(false);
    const [multilinkUrl, setMultilinkUrl] = useState("");
    const [ownerUid, setOwnerUid] = useState("");

    useEffect(() => {
        const cargarFormulario = async () => {
            const docRef = doc(db, "multilinks", id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setCampos(data.formulario_campos || []);
                setMultilinkUrl(data.url); 
                setOwnerUid(data.admin_uid);
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
            respuestasEtiquetadas[campo.label] = formData[campo.nombre];
        });

        try {
            await addDoc(collection(db, "respuestas_formulario"), {
                multilink_url: multilinkUrl,
                owner_uid: ownerUid,
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
        return (
            <div className={styles.root}>
                <div className={styles.card}>
                    <div className={styles.successCard}>
                        <i className={`bi bi-check-circle-fill ${styles.successIcon}`}></i>
                        <div className={styles.successTitle}>¡Recibido!</div>
                        <div className={styles.successText}>
                            Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.
                        </div>
                    </div>
                    <div className={styles.footer}>
                        Powered by{" "}
                        <a className={styles.anchor} href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">
                            Gibra Company
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.card}>
                <div className={styles.title}>Contáctanos</div>
                <div className={styles.subtitle}>Déjanos tu información y te responderemos a la brevedad.</div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {campos.map((campo, i) => (
                        <div key={i} className={styles.field}>
                            {campo.tipo !== "checkbox" && (
                                <label className={styles.label}>{campo.label}</label>
                            )}

                            {campo.tipo === "textarea" ? (
                                <textarea
                                    className={styles.textarea}
                                    name={campo.nombre}
                                    required={campo.requerido}
                                    onChange={handleChange}
                                    placeholder={`Escribe tu ${campo.label.toLowerCase()}...`}
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
                                    <span className={styles.checkboxLabel}>{campo.label}</span>
                                </label>
                            ) : (
                                <input
                                    className={styles.input}
                                    type={campo.tipo}
                                    name={campo.nombre}
                                    onChange={handleChange}
                                    required={campo.requerido}
                                    placeholder={`Tu ${campo.label.toLowerCase()}`}
                                />
                            )}
                        </div>
                    ))}
                    <button className={styles.btn} type="submit">Enviar mensaje</button>
                </form>

                <div className={styles.footer}>
                    Powered by{" "}
                    <a className={styles.anchor} href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}

export default FormularioCliente;
