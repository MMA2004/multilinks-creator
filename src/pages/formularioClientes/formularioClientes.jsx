import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import {enviarFormularioAlServidor} from "../../services/apiFormulario.js";

function FormularioCliente() {
    const { id } = useParams(); // este es el ID del multilink
    const [campos, setCampos] = useState([]);
    const [formData, setFormData] = useState({});
    const [enviado, setEnviado] = useState(false);
    const [multilinkUrl, setMultilinkUrl] = useState(""); // NUEVO

    useEffect(() => {
        const cargarFormulario = async () => {
            const docRef = doc(db, "multilinks", id);
            const snap = await getDoc(docRef);
            if (snap.exists()) {
                const data = snap.data();
                setCampos(data.formulario_campos || []);
                setMultilinkUrl(data.url); // <--- obtenemos la URL del multilink
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
            await enviarFormularioAlServidor(multilinkUrl, respuestasEtiquetadas); // usamos la URL
            setEnviado(true);
        } catch (err) {
            console.error(err);
            alert("Error al enviar el Formulario. Intenta de nuevo.");
        }
    };

    if (enviado) return <p>Gracias por enviar tu información.</p>;

    return (
        <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
            <h2>Formulario</h2>
            {campos.map((campo, i) => (
                <div key={i} style={{ marginBottom: "1rem" }}>
                    <label>{campo.label}</label><br />
                    {campo.tipo === "textarea" ? (
                        <textarea
                            name={campo.nombre}
                            required={campo.requerido}
                            onChange={handleChange}
                        />
                    ) : campo.tipo === "checkbox" ? (
                        <input
                            type="checkbox"
                            name={campo.nombre}
                            onChange={handleChange}
                            required={campo.requerido}
                        />
                    ) : (
                        <input
                            type={campo.tipo}
                            name={campo.nombre}
                            onChange={handleChange}
                            required={campo.requerido}
                        />
                    )}
                </div>
            ))}
            <button type="submit">Enviar</button>
        </form>
    );
}

export default FormularioCliente;
