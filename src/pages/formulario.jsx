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
                                url: `https://multilinks-creator.gibracompany.com/formulario/${id}`,
                                texto: "Formulario",
                                icono: "bi-ui-checks",
                                bg_color: "#000000",
                                text_color: "#ffffff",
                                icon_color: "#ffffff",
                                fijo: true,
                                tipo: "ResFormulario"
                            });
                        }

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
        <div className="fmx-root">
            <style>{styles}</style>


            <div className="container-fluid py-4">
                <div className="row g-4">
                    {/* Columna izquierda */}
                    <div className="col-md-5">
                        <div className="fmx-card shadow-sm">
                            <h3 className="fmx-h3">Personalización del Multilink</h3>
                            <div className="mb-3">
                                <label className="fmx-label">Título de la página</label>
                                <input className="fmx-input" name="titulo_pagina" value={formData.titulo_pagina} onChange={handleChange} />
                            </div>

                            <hr className="fmx-hr" />
                            <div className="mb-3">
                                <h4 className="fmx-h4">Título</h4>
                                <input className="fmx-input" name="titulo" value={formData.titulo} onChange={handleChange} />
                            </div>

                            <div className="row g-3">
                                <div className="col-3">
                                    <label className="fmx-label">Color</label>
                                    <input type="color" className="fmx-color" name="color_titulo" value={formData.color_titulo || "#000000"} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Tamaño</label>
                                    <input type="number" name="tamano_titulo" className="fmx-input" min="0" value={parseInt(formData.tamano_titulo) || 0} onChange={(e)=> setFormData({ ...formData, tamano_titulo: `${e.target.value}px` })} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Margen Superior</label>
                                    <input type="number" name="mt_titulo" className="fmx-input" value={parseInt(formData.mt_titulo) || 0} onChange={(e)=> setFormData({ ...formData, mt_titulo: `${e.target.value}px` })} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Margen Inferior</label>
                                    <input type="number" name="mb_titulo" className="fmx-input" value={parseInt(formData.mb_titulo) || 0} onChange={(e)=> setFormData({ ...formData, mb_titulo: `${e.target.value}px` })} />
                                </div>
                            </div>

                            <hr className="fmx-hr" />

                            <div className="mb-3">
                                <h4 className="fmx-h4">Subtítulo</h4>
                                <input className="fmx-input" name="subtitulo" value={formData.subtitulo} onChange={handleChange} />
                            </div>

                            <div className="row g-3">
                                <div className="col-3">
                                    <label className="fmx-label">Color</label>
                                    <input type="color" className="fmx-color" name="color_subtitulo" value={formData.color_subtitulo || "#000000"} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Tamaño</label>
                                    <input type="number" name="tamano_subtitulo" className="fmx-input" min="0" value={parseInt(formData.tamano_subtitulo) || 0} onChange={(e)=> setFormData({ ...formData, tamano_subtitulo: `${e.target.value}px` })} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Margen Inferior</label>
                                    <input type="number" name="mb_subtitulo" className="fmx-input" value={parseInt(formData.mb_subtitulo) || 0} onChange={(e)=> setFormData({ ...formData, mb_subtitulo: `${e.target.value}px` })} />
                                </div>
                            </div>

                            <hr className="fmx-hr" />

                            <div className="row g-3">
                                <div className="col">
                                    <label className="fmx-label">Color del fondo</label>
                                    <input type="color" className="fmx-color" name="fondo" value={formData.fondo || "#ffffff"} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Color del Footer</label>
                                    <input type="color" className="fmx-color" name="color_footer" value={formData.color_footer || "#000000"} onChange={handleChange} />
                                </div>
                            </div>

                            <hr className="fmx-hr" />

                            <div className="mb-2">
                                <h4 className="fmx-h4">Subir imagen</h4>
                                <SubirImagen urlInicial={formData.imagen} onUploadSuccess={(url) => setFormData({ ...formData, imagen: url })} onClickAdicional={guardarYGenerar} />
                            </div>

                            <div className="row g-3">
                                <div className="col">
                                    <label className="fmx-label">Tamaño imagen</label>
                                    <input type="number" className="fmx-input" name="tamano_foto" min="0" value={parseInt(formData.tamano_foto) || 0} onChange={(e) => setFormData({ ...formData, tamano_foto: `${e.target.value}px` })} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Borde (%)</label>
                                    <input type="number" className="fmx-input" name="borde" min="0" max="50" value={parseInt(formData.borde) || 0} onChange={(e) => {
                                        const value = Math.min(50, Math.max(0, parseInt(e.target.value) || 0));
                                        setFormData({ ...formData, borde: `${value}%` });
                                    }} />
                                </div>
                            </div>

                            <div className="fmx-actions">
                                <button className="fmx-btn" onClick={guardarYGenerar}><i className="bi bi-save2"/> Guardar cambios</button>
                                <button className="fmx-btn fmx-outline" onClick={() => console.log(JSON.stringify(formData, null, 2))}><i className="bi bi-braces"/> Imprimir JSON</button>
                            </div>
                        </div>

                        <div className="fmx-card shadow-sm">
                            <h3 className="fmx-h3">Información de contacto</h3>

                            <div className="form-check form-switch mb-3">
                                <input className="form-check-input" type="checkbox" name="mostrar_boton_contacto" id="mostrar_boton_contacto" checked={formData.mostrar_boton_contacto} onChange={handleChange} />
                                <label className="form-check-label" htmlFor="mostrar_boton_contacto">Mostrar botón de contacto</label>
                            </div>

                            <div className="row g-3 mb-3">
                                <div className="col">
                                    <label className="fmx-label">Color del fondo</label>
                                    <input type="color" className="fmx-color" name="contacto_bg" value={formData.contacto_bg || "#000000"} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Color del texto</label>
                                    <input type="color" className="fmx-color" name="contacto_color" value={formData.contacto_color || "#ffffff"} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Color del borde</label>
                                    <input type="color" className="fmx-color" name="contacto_borde_color" value={formData.contacto_borde_color || "#000000"} onChange={handleChange} />
                                </div>
                                <div className="col">
                                    <label className="fmx-label">Grosor del borde (px)</label>
                                    <input type="number" min="0" max="15" className="fmx-input" name="contacto_borde_grosor" value={formData.contacto_borde_grosor || 0} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="fmx-label">Nombre</label>
                                <input type="text" className="fmx-input" name="nombre" value={formData.nombre} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="fmx-label">Nota</label>
                                <input type="text" className="fmx-input" name="nota" value={formData.nota} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="fmx-label">Teléfono</label>
                                <input type="tel" className="fmx-input" name="telefono" value={formData.telefono} onChange={handleChange} />
                            </div>
                            <div className="mb-1">
                                <label className="fmx-label">Correo</label>
                                <input type="email" className="fmx-input" name="correo" value={formData.correo} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Columna centro-derecha */}
                    <div className="col-md-5">
                        <div className="fmx-card shadow-sm">
                            <div className="mt-2">
                                <EditorBotones botones={formData.botones} setBotones={(nuevosBotones) => setFormData({ ...formData, botones: nuevosBotones })} />
                            </div>
                        </div>

                        {formData.formulario_activado && (
                            <div className="fmx-card shadow-sm">
                                <h4 className="fmx-h4">Campos del Formulario</h4>
                                {formData.formulario_campos?.map((campo, idx) => (
                                    <div key={idx} className="fmx-fieldrow">
                                        <input
                                            className="fmx-input"
                                            placeholder="Etiqueta"
                                            value={campo.label}
                                            onChange={e => {
                                                const nuevos = [...formData.formulario_campos];
                                                nuevos[idx].label = e.target.value;
                                                setFormData({ ...formData, formulario_campos: nuevos });
                                            }}
                                        />

                                        <select
                                            className="fmx-input"
                                            value={campo.tipo}
                                            onChange={e => {
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

                                        <label className="fmx-check">
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
                                            <span>Requerido</span>
                                        </label>

                                        <button
                                            className="fmx-btn fmx-danger fmx-del"
                                            onClick={() => {
                                                const nuevos = formData.formulario_campos.filter((_, i) => i !== idx);
                                                setFormData({ ...formData, formulario_campos: nuevos });
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}

                                <button
                                    className="fmx-btn fmx-outline mt-2"
                                    onClick={() => {
                                        const nuevos = formData.formulario_campos ? [...formData.formulario_campos] : [];
                                        nuevos.push({ nombre: `campo${nuevos.length + 1}`, label: "", tipo: "text", requerido: false });
                                        setFormData({ ...formData, formulario_campos: nuevos });
                                    }}
                                >
                                    Agregar campo
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Columna vista previa */}
                    <div className="col-md-2">
                        <div className="fmx-phone">
                            <VistaPrevia data={formData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Formulario;

const styles = `
  .fmx-root { min-height:100vh; width:100vw; padding:24px; box-sizing:border-box; background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6); background-size:180% 180%; animation: gradientMove 12s ease infinite; }
  @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
  .fmx-card { color:#fff; padding:24px; border-radius:22px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.20); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); margin-bottom:16px; }
  .fmx-h3 { font-size: clamp(18px, 3vw, 22px); font-weight:800; margin: 0 0 14px; }
  .fmx-h4 { font-size: clamp(16px, 2.4vw, 18px); font-weight:800; margin: 0 0 10px; }
  .fmx-label { font-size:12px; opacity:.95; display:block; margin-bottom:6px; }
  .fmx-input { width:100%; border-radius:12px; padding:12px 14px; font-size:14px; color:#0f172a; background: rgba(255,255,255,.95); border:1px solid rgba(15,23,42,.08); outline:none; transition:.15s ease; }
  .fmx-input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }
  .fmx-color { width:100%; height:42px; padding:0; border-radius:12px; border:1px solid rgba(15,23,42,.08); background:#fff; }
  .fmx-actions { display:flex; gap:10px; flex-wrap:wrap; margin-top:16px; }
  .fmx-btn { appearance:none; border:0; border-radius:12px; padding:10px 12px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
  .fmx-btn.fmx-outline { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }
  .fmx-btn.fmx-danger { background: #dc2626; }
  .fmx-hr { border:0; height:1px; background: rgba(255,255,255,.18); margin:14px 0; }
  .fmx-note { font-size:12px; opacity:.95; margin-bottom:6px; }
  .fmx-phone { width: 450px; max-height: 80vh; overflow-y: auto; border: 16px solid #333; border-radius: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.3); position: fixed; top: 20px; right: 40px; background: #fff; z-index: 1000; }
  @media (max-width: 992px) {
  .fmx-phone {
    position: static;
    width: 100%;
    max-height: none;
    border: 16px solid #333;
    border-radius: 40px;
    box-shadow: none;
  }

  .col-md-5, .col-md-2 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .container-fluid > .row {
    flex-direction: column;
  }
}
.fmx-fieldrow {
  display: grid;
  grid-template-columns: 1fr 160px auto auto;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.fmx-check {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.30);
  color: #fff;
}

.fmx-del {
  justify-self: end;
}

@media (max-width: 768px) {
  .fmx-fieldrow {
    grid-template-columns: 1fr;
  }
  .fmx-del {
    justify-self: stretch;
  }
  .fmx-check {
    justify-content: flex-start;
  }
}
`;

