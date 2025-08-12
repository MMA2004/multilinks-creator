import {useEffect, useState} from "react";
import { Accordion } from "react-bootstrap";

function EditorBotones({ botones, setBotones }) {
    const [nuevoBoton, setNuevoBoton] = useState({
        url: "",
        texto: "",
        icono: "",
        bg_color: "#ffffff",
        text_color: "#3aabd4",
        icon_color: "#3aabd4",
        borde_color: "#ffffff",
        borde_grosor: "0",
    });

    useEffect(() => {
        const bg_color = localStorage.getItem("ultimo_bg_color") || "#ffffff";
        const text_color = localStorage.getItem("ultimo_text_color") || "#3aabd4";
        const icon_color = localStorage.getItem("ultimo_icon_color") || "#3aabd4";
        const borde_color = localStorage.getItem("ultimo_borde_color") || "#000000";
        const borde_grosor = localStorage.getItem("ultimo_borde_grosor") || "0";

        setNuevoBoton((prev) => ({
            ...prev,
            bg_color,
            text_color,
            icon_color,
            borde_color,
            borde_grosor,
        }));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoBoton({ ...nuevoBoton, [name]: value });

        if (["bg_color", "text_color", "icon_color", "borde_color", "borde_grosor"].includes(name)) {
            localStorage.setItem(`ultimo_${name}`, value);
        }
    };

    const handleBotonEdit = (index, campo, valor) => {
        const nuevos = [...botones];
        nuevos[index][campo] = valor;
        setBotones(nuevos);
    };

    const eliminarBoton = (index) => {
        const nuevos = [...botones];
        nuevos.splice(index, 1);
        setBotones(nuevos);
    };

    const agregarBoton = () => {
        const nuevos = [...botones];
        const indexResFormulario = nuevos.findIndex((boton) => boton.tipo === "ResFormulario");

        const nuevo = {
            ...nuevoBoton,
            bg_color: localStorage.getItem("ultimo_bg_color") || nuevoBoton.bg_color,
            text_color: localStorage.getItem("ultimo_text_color") || nuevoBoton.text_color,
            icon_color: localStorage.getItem("ultimo_icon_color") || nuevoBoton.icon_color,
            borde_color: localStorage.getItem("ultimo_borde_color") || nuevoBoton.borde_color,
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || nuevoBoton.borde_grosor,
        };

        if (indexResFormulario !== -1) {
            nuevos.splice(indexResFormulario, 0, nuevo);
        } else {
            nuevos.push(nuevo);
        }

        setBotones(nuevos);
        setNuevoBoton({
            url: "",
            texto: "",
            icono: "",
            bg_color: localStorage.getItem("ultimo_bg_color") || "#ffffff",
            text_color: localStorage.getItem("ultimo_text_color") || "#3aabd4",
            icon_color: localStorage.getItem("ultimo_icon_color") || "#3aabd4",
            borde_color: localStorage.getItem("ultimo_borde_color") || "#000000",
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || "0",
        });
    };

    const moverBotonArriba = (index) => {
        if (index === 0) return;
        const nuevos = [...botones];
        [nuevos[index - 1], nuevos[index]] = [nuevos[index], nuevos[index - 1]];
        setBotones(nuevos);
    };

    const moverBotonAbajo = (index) => {
        if (index === botones.length - 1) return;
        const nuevos = [...botones];
        [nuevos[index + 1], nuevos[index]] = [nuevos[index], nuevos[index + 1]];
        setBotones(nuevos);
    };

    const iconosDisponibles = [
        { nombre: 'WhatsApp', clase: 'bi-whatsapp' },
        { nombre: 'Instagram', clase: 'bi-instagram' },
        { nombre: 'Facebook', clase: 'bi-facebook' },
        { nombre: 'Tiktok', clase: 'bi-tiktok' },
        { nombre: 'Lista', clase: 'bi-list' },
        { nombre: 'Teléfono', clase: 'bi-telephone' },
        { nombre: 'Correo', clase: 'bi-envelope' },
        { nombre: 'Globo web', clase: 'bi-globe' },
        { nombre: 'Ubicación', clase: 'bi-geo-alt-fill' },
        { nombre: 'Enlace', clase: 'bi-link-45deg' },
        { nombre: 'Spotify', clase: 'bi-spotify' },
        { nombre: 'Youtube', clase: 'bi-youtube' },
        { nombre: 'LinkedIn', clase: 'bi-linkedin' },
        { nombre: 'Formulario', clase: 'bi bi-ui-checks' },
    ];

    return (
        <div className="ebx-root">
            <style>{styles}</style>

            <h3 className="ebx-title">Botones</h3>

            <Accordion defaultActiveKey="0" alwaysOpen className="ebx-acc">
                {botones.map((b, i) => (
                    <Accordion.Item eventKey={i.toString()} key={i} className="ebx-item">
                        <Accordion.Header>
                            <div className="ebx-itemhead">
                                <span className="ebx-badge">#{i + 1}</span>
                                <span className="ebx-itemtitle">{b.texto || "Sin texto"}</span>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body className="ebx-body">
                            <div className="mb-3">
                                <label className="ebx-label">Texto</label>
                                <input className="ebx-input" value={b.texto} onChange={(e) => handleBotonEdit(i, "texto", e.target.value)} />
                            </div>

                            <div className="mb-3">
                                <label className="ebx-label">URL</label>
                                <input className="ebx-input" value={b.url} onChange={(e) => handleBotonEdit(i, "url", e.target.value)} readOnly={b.tipo === "ResFormulario"} />
                            </div>

                            <div className="mb-2">
                                <label className="ebx-label">Icono</label>
                                <select className="ebx-input" value={b.icono} onChange={(e) => handleBotonEdit(i, "icono", e.target.value)}>
                                    <option value="">-- Selecciona un icono --</option>
                                    {iconosDisponibles.map((icono) => (
                                        <option key={icono.clase} value={icono.clase}>
                                            {icono.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="row g-2">
                                <div className="col">
                                    <label className="ebx-label">Color del fondo</label>
                                    <input type="color" className="ebx-color" value={b.bg_color} onChange={(e) => handleBotonEdit(i, "bg_color", e.target.value)} />
                                </div>
                                <div className="col">
                                    <label className="ebx-label">Color del texto</label>
                                    <input type="color" className="ebx-color" value={b.text_color} onChange={(e) => handleBotonEdit(i, "text_color", e.target.value)} />
                                </div>
                                <div className="col">
                                    <label className="ebx-label">Color del ícono</label>
                                    <input type="color" className="ebx-color" value={b.icon_color} onChange={(e) => handleBotonEdit(i, "icon_color", e.target.value)} />
                                </div>
                            </div>

                            <div className="row g-2 mt-2">
                                <div className="col">
                                    <label className="ebx-label">Color del borde</label>
                                    <input type="color" className="ebx-color" value={b.borde_color} onChange={(e) => handleBotonEdit(i, "borde_color", e.target.value)} />
                                </div>
                                <div className="col">
                                    <label className="ebx-label">Grosor del borde (px)</label>
                                    <input className="ebx-input" type="number" min="0" max="15" value={b.borde_grosor} onChange={(e) => handleBotonEdit(i, "borde_grosor", e.target.value)} />
                                </div>
                            </div>

                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {!b.fijo && (
                                    <button className="ebx-btn ebx-danger" onClick={() => eliminarBoton(i)}>
                                        <i className="bi bi-x-circle" /> Eliminar
                                    </button>
                                )}
                                <button className="ebx-btn ebx-outline" onClick={() => moverBotonArriba(i)} disabled={i === 0}>
                                    <i className="bi bi-arrow-up" /> Subir
                                </button>
                                <button className="ebx-btn ebx-outline" onClick={() => moverBotonAbajo(i)} disabled={i === botones.length - 1}>
                                    <i className="bi bi-arrow-down" /> Bajar
                                </button>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <hr className="ebx-hr" />
            <h3 className="ebx-title">Agregar nuevo botón</h3>

            <div className="mb-2">
                <input name="texto" placeholder="Texto" className="ebx-input" value={nuevoBoton.texto} onChange={handleInputChange} />
            </div>
            <div className="mb-2">
                <input name="url" placeholder="URL" className="ebx-input" value={nuevoBoton.url} onChange={handleInputChange} />
            </div>
            <div className="mb-2">
                <label className="ebx-label">Icono</label>
                <select name="icono" className="ebx-input" value={nuevoBoton.icono} onChange={handleInputChange}>
                    <option value="">-- Selecciona un icono --</option>
                    {iconosDisponibles.map((icono) => (
                        <option key={icono.clase} value={icono.clase}>
                            {icono.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row g-2 mt-2">
                <div className="col">
                    <label className="ebx-label">Color del fondo</label>
                    <input type="color" name="bg_color" className="ebx-color" value={nuevoBoton.bg_color} onChange={handleInputChange} />
                </div>
                <div className="col">
                    <label className="ebx-label">Color del texto</label>
                    <input type="color" name="text_color" className="ebx-color" value={nuevoBoton.text_color} onChange={handleInputChange} />
                </div>
                <div className="col">
                    <label className="ebx-label">Color del ícono</label>
                    <input type="color" name="icon_color" className="ebx-color" value={nuevoBoton.icon_color} onChange={handleInputChange} />
                </div>
            </div>

            <div className="row g-2 mt-2">
                <div className="col">
                    <label className="ebx-label">Color del borde</label>
                    <input type="color" name="borde_color" className="ebx-color" value={nuevoBoton.borde_color} onChange={handleInputChange} />
                </div>
                <div className="col">
                    <label className="ebx-label">Grosor del borde (px)</label>
                    <input className="ebx-input" type="number" name="borde_grosor" min="0" max="15" value={nuevoBoton.borde_grosor} onChange={handleInputChange} />
                </div>
            </div>

            <button className="ebx-btn ebx-success mt-2" onClick={agregarBoton}>
                <i className="bi bi-plus-circle"></i> Agregar
            </button>
        </div>
    );
}

export default EditorBotones;

const styles = `
  .ebx-root { width: 100%; max-width: 540px; color:#fff; }
  .ebx-title { font-size: clamp(18px, 3vw, 22px); font-weight:800; margin-bottom:12px; }
  .ebx-acc .accordion-item { background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.18); overflow:hidden; border-radius:14px; margin-bottom:10px; }
  .ebx-acc .accordion-button { background: rgba(0,0,0,.15); color:#fff; box-shadow:none; }
  .ebx-itemhead { display:flex; align-items:center; gap:10px; }
  .ebx-badge { background: rgba(255,255,255,.20); border:1px solid rgba(255,255,255,.30); padding:4px 8px; border-radius:999px; font-size:12px; }
  .ebx-itemtitle { font-weight:700; }
  .ebx-body { background: rgba(255,255,255,.06); }

  .ebx-label { font-size:12px; opacity:.95; display:block; margin-bottom:6px; }
  .ebx-input { width:100%; border-radius:12px; padding:10px 12px; font-size:14px; color:#0f172a; background: rgba(255,255,255,.95); border:1px solid rgba(15,23,42,.08); outline:none; transition:.15s ease; }
  .ebx-input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,.35); border-color: rgba(255,255,255,.6); }
  .ebx-color { width:100%; height:42px; padding:0; border-radius:12px; border:1px solid rgba(15,23,42,.08); background:#fff; }

  .ebx-btn { appearance:none; border:0; border-radius:12px; padding:10px 12px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
  .ebx-btn.ebx-outline { background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); }
  .ebx-btn.ebx-success { background:#10b981; }
  .ebx-btn.ebx-danger { background:#dc2626; }

  .ebx-hr { border:0; height:1px; background: rgba(255,255,255,.18); margin:14px 0; }
`;

