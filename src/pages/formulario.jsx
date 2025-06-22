// src/pages/Formulario.jsx
import {useEffect, useState} from "react";
import VistaPrevia from "./vistaPrevia/vistaPrevia.jsx";
import EditorBotones from "../components/editorBotones/editorBotones.jsx";
import SubirImagen from "../components/subirImagenes/subirImagen.jsx";
import { useParams } from 'react-router-dom';
import {cargarMultilinkDesdeFirebase} from "../services/cargarMultilinkDesdeFirebase.js";
import {guardarMultilinkEnFirebase} from "../services/guardarMultilinkEnFirebase.js";
import {generarMultilink} from "../services/api.js";


function Formulario() {
    const [formData, setFormData] = useState({
        titulo_pagina: "",
        titulo: "",
        subtitulo: "",
        telefono: "",
        correo: "",
        fondo: "",
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
        nombre: "",
        nota: "",
        botones: [
            {
                url: "",
                texto: "",
                icono: "",
                bg_color: "",
                text_color: "",
                icon_color: "",
            },
        ],
    });

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            cargarMultilinkDesdeFirebase(id)
                .then(data => {
                    if (data) setFormData(data);
                    else console.warn("Multilink no encontrado");
                })
                .catch(err => {
                    console.error("Error cargando multilink:", err);
                });
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const guardarYGenerar = async () => {
        try {
            await guardarMultilinkEnFirebase(id, formData);
            await generarMultilink(formData);
            alert("Multilink actualizado correctamente.");
        } catch (error) {
            console.error("Error al guardar y generar:", error);
            alert("Error al guardar o generar el multilink.");
        }
    };

    return (
        <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
            <div style={{ flex: 1 }}>
                <h2>Personalización Multilink</h2>

                <label>Título</label>
                <input name="titulo" value={formData.titulo} onChange={handleChange} /><br />

                <label>Subtítulo</label>
                <input name="subtitulo" value={formData.subtitulo} onChange={handleChange} /><br />

                <label>Color del fondo</label>
                <input
                    type="color"
                    name="fondo"
                    value={formData.fondo || "#ffffff"}
                    onChange={handleChange}
                /><br />

                <label>Imagen</label>
                <SubirImagen
                    onUploadSuccess={(url) => setFormData({ ...formData, imagen: url })}
                /><br />

                <label>Tamaño de la imagen</label>
                <input name="tamano_foto" value={formData.tamano_foto} onChange={handleChange} /><br />

                <label>Color Título</label>
                <input type="color" name="color_titulo" value={formData.color_titulo} onChange={handleChange} /><br />

                <label>Tamaño Titulo</label>
                <input name="tamano_titulo" value={formData.tamano_titulo} onChange={handleChange} /><br />

                <label>Margen Superior Título</label>
                <input
                    type="number"
                    name="mt_titulo"
                    value={parseInt(formData.mt_titulo) || 0}
                    onChange={(e) =>
                        setFormData({ ...formData, mt_titulo: `${e.target.value}px` })
                    }
                /><br />

                <label>Margen Inferior Título</label>
                <input
                    type="number"
                    name="mb_titulo"
                    value={parseInt(formData.mb_titulo) || 0}
                    onChange={(e) =>
                        setFormData({ ...formData, mb_titulo: `${e.target.value}px` })
                    }
                /><br />

                <label>Color Subtítulo</label>
                <input type="color" name="color_subtitulo" value={formData.color_subtitulo} onChange={handleChange} /><br />

                <label>Margen Inferior Subtítulo</label>
                <input
                    type="number"
                    name="mb_subtitulo"
                    value={parseInt(formData.mb_subtitulo) || 0}
                    onChange={(e) =>
                        setFormData({ ...formData, mb_subtitulo: `${e.target.value}px` })
                    }
                /><br />

                <label>Color Footer</label>
                <input type="color" name="color_footer" value={formData.color_footer} onChange={handleChange} /><br />

                <h2>Información de contacto</h2>

                <label>
                    <input
                        type="checkbox"
                        name="mostrar_boton_contacto"
                        checked={formData.mostrar_boton_contacto}
                        onChange={handleChange}
                    />
                    Mostrar botón de contacto
                </label><br />

                <label>Color fondo botón contacto</label>
                <input type="color" name="contacto_bg" value={formData.contacto_bg} onChange={handleChange} /><br />

                <label>Color texto botón contacto</label>
                <input type="color" name="contacto_color" value={formData.contacto_color} onChange={handleChange} /><br />

                <label>Nombre</label>
                <input name="nombre" value={formData.nombre} onChange={handleChange} /><br />

                <label>Nota</label>
                <input name="nota" value={formData.nota} onChange={handleChange} /><br />

                <label>Teléfono</label>
                <input name="telefono" value={formData.telefono} onChange={handleChange} /><br />

                <label>Correo</label>
                <input name="correo" value={formData.correo} onChange={handleChange} /><br />


                <button onClick={() => console.log(JSON.stringify(formData, null, 2))}>
                    Imprimir JSON en consola
                </button>

            </div>

            <EditorBotones
                botones={formData.botones}
                setBotones={(nuevosBotones) => setFormData({ ...formData, botones: nuevosBotones })}
            />

            <button onClick={guardarYGenerar}>
                Guardar cambios
            </button>

            <div style={{ flex: 1 }}>
                <VistaPrevia data={formData} />
            </div>
        </div>
    );
}

export default Formulario;
