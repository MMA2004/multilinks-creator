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
        borde: "",
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
        contacto_borde_color: "",
        contacto_borde_grosor: "",
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
                borde_color: "",
                borde_grosor: ""
            },
        ],
    });

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            cargarMultilinkDesdeFirebase(id)
                .then(data => {
                    if (data) {
                        const yaTieneFormulario = data.botones?.some(b => b.tipo === "ResFormulario");
                        const nuevosBotones = [...(data.botones || [])];
                        if (data.formulario_activado && !yaTieneFormulario) {
                            nuevosBotones.push({
                                url: `http://localhost:5173/formulario/${id}`,
                                texto: "Formulario",
                                icono: "bi-ui-checks",
                                bg_color: "#000000",
                                text_color: "#ffffff",
                                icon_color: "#ffffff",
                                fijo: true,
                                tipo: "ResFormulario"
                            });
                        }

                        // Actualiza los datos del ResFormulario
                        setFormData({
                            ...data,
                            botones: nuevosBotones
                        });
                    } else console.warn("Multilink no encontrado");
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
        <div className="container-fluid py-4">
            <div className="row">


                <div className="col-md-5">
                    <div className="mb-4">
                        <div className="card p-4 mb-4 shadow-sm">
                            <h3 className="mb-4">Personalización del Multilink</h3>
                            <div className="mb-3">
                                <label className="form-label">Título de la página</label>
                                <input className="form-control" name="titulo_pagina" value={formData.titulo_pagina} onChange={handleChange} />
                            </div>
                            <hr />
                            <div className="mb-3">
                                <h4 className="form-label">Título</h4>
                                <input className="form-control" name="titulo" value={formData.titulo} onChange={handleChange} />
                            </div>

                            <div className="row">
                                <div className="col-2">
                                    <label className="form-label">Color</label>
                                    <input type="color" className="form-control form-control-color" name="color_titulo" value={formData.color_titulo} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="form-label">Tamaño</label>
                                    <input
                                        type="number"
                                        name="tamano_titulo"
                                        className="form-control"
                                        min="0"
                                        value={parseInt(formData.tamano_titulo) || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, tamano_titulo: `${e.target.value}px` })
                                        }
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label">Margen Superior</label>
                                    <input
                                        type="number"
                                        name="mt_titulo"
                                        className="form-control"
                                        value={parseInt(formData.mt_titulo) || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mt_titulo: `${e.target.value}px` })
                                        }
                                    />
                                </div>

                                <div className="col">
                                    <label className="form-label">Margen Inferior</label>
                                    <input
                                        type="number"
                                        name="mb_titulo"
                                        className="form-control"
                                        value={parseInt(formData.mb_titulo) || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mb_titulo: `${e.target.value}px` })
                                        }
                                    />
                                </div>
                            </div>


                            <hr />

                            <div className="mb-3">
                                <h4 className="form-label">Subtítulo</h4>
                                <input className="form-control" name="subtitulo" value={formData.subtitulo} onChange={handleChange} />
                            </div>

                            <div className="row">

                                <div className="col">
                                    <label className="form-label">Color</label>
                                    <input type="color" className="form-control form-control-color" name="color_subtitulo" value={formData.color_subtitulo} onChange={handleChange} />
                                </div>

                                <div className="col">
                                    <label className="form-label">Tamaño</label>
                                    <input
                                        type="number"
                                        name="tamano_subtitulo"
                                        className="form-control"
                                        min="0"
                                        value={parseInt(formData.tamano_subtitulo) || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, tamano_subtitulo: `${e.target.value}px` })
                                        }
                                    />
                                </div>

                                <div className="col">
                                    <label className="form-label">Margen Inferior</label>
                                    <input
                                        type="number"
                                        name="mb_subtitulo"
                                        className="form-control"
                                        value={parseInt(formData.mb_subtitulo) || 0}
                                        onChange={(e) =>
                                            setFormData({ ...formData, mb_subtitulo: `${e.target.value}px` })
                                        }
                                    />
                                </div>
                            </div>

                            <hr />

                            <div className="row">
                                <div className="col">
                                    <label className="form-label">Color del fondo</label>
                                    <input type="color" className="form-control form-control-color" name="fondo" value={formData.fondo || "#ffffff"} onChange={handleChange} />
                                </div>

                                <div className="col">
                                    <label className="form-label">Color del Footer</label>
                                    <input type="color" className="form-control form-control-color" name="color_footer" value={formData.color_footer} onChange={handleChange} /><br />
                                </div>

                            </div>

                            <hr />

                            <div className="mb-1">
                                <h4 className="form-label mb-4">Subir imagen</h4>
                                <SubirImagen
                                    urlInicial={formData.imagen}
                                    onUploadSuccess={(url) => setFormData({ ...formData, imagen: url })}
                                    onClickAdicional={guardarYGenerar}
                                />
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label className="form-label">Tamaño imagen</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="tamano_foto"
                                        min="0"
                                        value={parseInt(formData.tamano_foto) || 0}
                                        onChange={(e) => setFormData({ ...formData, tamano_foto: `${e.target.value}px` })}
                                    />
                                </div>
                                <div className="col">
                                    <label className="form-label">Borde (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
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

                            <div className="mt-4">
                                <button className="btn btn-primary me-2" onClick={guardarYGenerar}>Guardar cambios</button>
                                <button className="btn btn-outline-secondary" onClick={() => console.log(JSON.stringify(formData, null, 2))}>
                                    Imprimir JSON
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="card p-4 mb-4 shadow-sm">
                            <h3 className="form-label mb-4">Información de contacto</h3>

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

                            <div className="row mb-4">
                                <div className="col">
                                    <label className="form-label">Color del fondo</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        name="contacto_bg"
                                        value={formData.contacto_bg}
                                        onChange={handleChange}
                                        title="Elige color"
                                    />
                                </div>

                                <div className="col">
                                    <label className="form-label">Color del texto</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        name="contacto_color"
                                        value={formData.contacto_color}
                                        onChange={handleChange}
                                        title="Elige color"
                                    />
                                </div>

                                <div className="col">
                                    <label className="form-label">Color del borde</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        name="contacto_borde_color"
                                        value={formData.contacto_borde_color}
                                        onChange={handleChange}
                                        title="Elige color"
                                    />
                                </div>

                                <div className="col">
                                    <label className="form-label">Grosor del borde</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="15"
                                        className="form-control form-control-color"
                                        name="contacto_borde_grosor"
                                        value={formData.contacto_borde_grosor}
                                        onChange={handleChange}
                                        title="Elige color"
                                    />
                                </div>
                            </div>



                            <div className="mb-3">
                                <label className="form-label">Nombre</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Nota</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="nota"
                                    value={formData.nota}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Teléfono</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Correo</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    name="correo"
                                    value={formData.correo}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="mb-4">
                        <div className="card p-3 mb-4 shadow-sm">
                            <EditorBotones
                                botones={formData.botones}
                                setBotones={(nuevosBotones) => setFormData({ ...formData, botones: nuevosBotones })}
                            />
                        </div>
                    </div>

                    <div className="mb-4">

                        {formData.formulario_activado && (
                            <div className="card p-4 mb-3">
                                <h4 className="form-label mb-4">Campos del Formulario</h4>
                                {formData.formulario_campos?.map((campo, idx) => (
                                    <div key={idx} className="row mb-2 align-items-center">
                                        <div className="col-4">
                                            <input
                                                className="form-control"
                                                placeholder="Etiqueta"
                                                value={campo.label}
                                                onChange={e => {
                                                    const nuevos = [...formData.formulario_campos];
                                                    nuevos[idx].label = e.target.value;
                                                    setFormData({ ...formData, formulario_campos: nuevos });
                                                }}
                                            />
                                        </div>
                                        <div className="col-3">
                                            <select
                                                className="form-select"
                                                value={campo.tipo}
                                                onChange={e => {
                                                    const nuevos = [...formData.formulario_campos];
                                                    nuevos[idx].tipo = e.target.value;
                                                    setFormData({ ...formData, formulario_campos: nuevos });
                                                }}
                                            >
                                                <option value="texto">Texto</option>
                                                <option value="email">Email</option>
                                                <option value="tel">Teléfono</option>
                                                <option value="textarea">Área de texto</option>
                                            </select>
                                        </div>
                                        <div className="col-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={campo.requerido}
                                                    onChange={e => {
                                                        const nuevos = [...formData.formulario_campos];
                                                        nuevos[idx].requerido = e.target.checked;
                                                        setFormData({ ...formData, formulario_campos: nuevos });
                                                    }}
                                                />
                                                <label className="form-check-label">Requerido</label>
                                            </div>
                                        </div>
                                        <div className="col-2">
                                            <button className="btn btn-sm btn-danger" onClick={() => {
                                                const nuevos = formData.formulario_campos.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, formulario_campos: nuevos });
                                            }}>Eliminar</button>
                                        </div>
                                    </div>
                                ))}
                                <button className="btn btn-outline-primary mt-3" onClick={() => {
                                    const nuevos = formData.formulario_campos ? [...formData.formulario_campos] : [];
                                    nuevos.push({ nombre: `campo${nuevos.length + 1}`, label: "", tipo: "texto", requerido: false });
                                    setFormData({ ...formData, formulario_campos: nuevos });
                                }}>
                                    Agregar campo
                                </button>
                            </div>
                        )}
                    </div>
                </div>


                <div className="col-md-2">
                    <div className="text-center">
                        <div style={{
                            width: "450px",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            border: "16px solid #333",
                            borderRadius: "40px",
                            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                            position: "fixed",
                            top: "20px",
                            right: "40px", // o left: "40px" si quieres que esté a la izquierda
                            backgroundColor: "#fff",
                            zIndex: 1000
                        }}>
                            <VistaPrevia data={formData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Formulario;
