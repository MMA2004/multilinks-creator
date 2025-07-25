import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAdmin } from "../../hooks/useAdmin.js"; // Asegúrate de proteger con un hook


function CrearMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const [formularioActivado, setFormularioActivado] = useState(false);

    const esAdmin = useAdmin(); // Asume que esto valida si el usuario es administrador

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!url || !clave) {
            setError("Por favor llena todos los campos.");
            return;
        }

        try {
            // Verificar si ya existe
            const q = query(collection(db, "multilinks"), where("url", "==", url.trim().toLowerCase()));
            const snap = await getDocs(q);

            if (!snap.empty) {
                setError("Ya existe un multilink con esa URL.");
                return;
            }

            // Plantilla por defecto
            const plantilla = {
                titulo_pagina: "Ejemplo",
                plantilla: "plantilla_comercial",
                titulo: "Título",
                subtitulo: "Subtítulo",
                telefono: "0000000000",
                correo: "correo",
                fondo: "#ffffff",
                imagen: "",
                tamano_foto: "120px",
                color_titulo: "#000000",
                tamano_titulo: "24px",
                mt_titulo: "20px",
                mb_titulo: "10px",
                color_subtitulo: "#000000",
                tamano_subtitulo: "18px",
                mt_subtitulo: "5px",
                mb_subtitulo: "15px",
                color_footer: "#000000",
                mostrar_boton_contacto: true,
                contacto_bg: "#000000",
                contacto_color: "#ffffff",
                nombre: "",
                nota: "",
                formulario_activado: false,
                formulario_campos: [],
                botones: [
                    {
                        url: "",
                        texto: "Boton",
                        icono: "",
                        bg_color: "#000000",
                        text_color: "#ffffff",
                        icon_color: "#ffffff",
                    },
                ],
            };

            // Crear multilink con plantilla base
            const docRef = await addDoc(collection(db, "multilinks"), {
                ...plantilla,
                url: url.trim().toLowerCase(),
                clave_edicion: clave,
                formulario_activado: formularioActivado,
                creado_en: new Date(),
            });

            setSuccess("Multilink creado exitosamente.");
            navigate(`/editar/${docRef.id}`);
        } catch (e) {
            console.error(e);
            setError("Error al crear el multilink.");
        }
    };

    if (!esAdmin) {
        return <p style={{ padding: "2rem", color: "red" }}>Acceso denegado. Solo administradores.</p>;
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Crear nuevo Multilink</h2>
            <form onSubmit={handleSubmit}>
                <label>URL deseada</label><br />
                <input
                    placeholder="Ej: juan-perez"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                /><br />

                <label>Clave de edición</label><br />
                <input
                    type="password"
                    placeholder="Clave secreta"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                /><br />
                <label>
                    <input
                        type="checkbox"
                        checked={formularioActivado}
                        onChange={(e) => setFormularioActivado(e.target.checked)}
                    />
                    Activar formulario personalizado
                </label><br />

                <button type="submit">Crear Multilink</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
            </form>
        </div>
    );
}

export default CrearMultilink;
