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
        borde_grosor: "0"
    });

    useEffect(() => {
        const bg_color = localStorage.getItem("ultimo_bg_color") || "#ffffff";
        const text_color = localStorage.getItem("ultimo_text_color") || "#3aabd4";
        const icon_color = localStorage.getItem("ultimo_icon_color") || "#3aabd4";
        const borde_color = localStorage.getItem("ultimo_borde_color") || "#000000";
        const borde_grosor = localStorage.getItem("ultimo_borde_grosor") || "0";

        setNuevoBoton(prev => ({
            ...prev,
            bg_color,
            text_color,
            icon_color,
            borde_color,
            borde_grosor
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
        const indexResFormulario = nuevos.findIndex(
            (boton) => boton.tipo === "ResFormulario"
        );

        // Crear nuevo botón con último color usado
        const nuevo = {
            ...nuevoBoton,
            bg_color: localStorage.getItem("ultimo_bg_color") || nuevoBoton.bg_color,
            text_color: localStorage.getItem("ultimo_text_color") || nuevoBoton.text_color,
            icon_color: localStorage.getItem("ultimo_icon_color") || nuevoBoton.icon_color,
            borde_color: localStorage.getItem("ultimo_borde_color") || nuevoBoton.borde_color,
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || nuevoBoton.borde_grosor
        };

        if (indexResFormulario !== -1) {
            // Insertar justo antes de ResFormulario
            nuevos.splice(indexResFormulario, 0, nuevo);
        } else {
            // Agregar al final
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
            borde_grosor: localStorage.getItem("ultimo_borde_grosor") || "0"
        });
    };

    const moverBotonArriba = (index) => {
        if (index === 0) return; // No puede subir el primero
        const nuevos = [...botones];
        [nuevos[index - 1], nuevos[index]] = [nuevos[index], nuevos[index - 1]];
        setBotones(nuevos);
    };

    const moverBotonAbajo = (index) => {
        if (index === botones.length - 1) return; // No puede bajar el último
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
        <div style={{ width: "540px" }}>
            <h3 className="mb-4">Botones</h3>
            <Accordion defaultActiveKey="0" alwaysOpen>
                {botones.map((b, i) => (
                    <Accordion.Item eventKey={i.toString()} key={i}>
                        <Accordion.Header>
                            Botón {i + 1}: {b.texto || "Sin texto"}
                        </Accordion.Header>
                        <Accordion.Body>
                            <div className="mb-3">
                                <label>Texto</label>
                                <input
                                    className="form-control"
                                    value={b.texto}
                                    onChange={e => handleBotonEdit(i, "texto", e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label>URL</label>
                                <input
                                    className="form-control"
                                    value={b.url}
                                    onChange={e => handleBotonEdit(i, "url", e.target.value)}
                                    readOnly={b.tipo === "ResFormulario"}
                                />
                            </div>
                            <div className="mb-2">
                                <label>Icono</label>
                                <select
                                    className="form-select"
                                    value={b.icono}
                                    onChange={e => handleBotonEdit(i, "icono", e.target.value)}
                                >
                                    <option value="">-- Selecciona un icono --</option>
                                    {iconosDisponibles.map(icono => (
                                        <option key={icono.clase} value={icono.clase}>
                                            {icono.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="row">
                                <div className="col">
                                    <label>Color del fondo</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        value={b.bg_color}
                                        onChange={e => handleBotonEdit(i, "bg_color", e.target.value)}
                                    />
                                </div>
                                <div className="col">
                                    <label>Color del texto</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        value={b.text_color}
                                        onChange={e => handleBotonEdit(i, "text_color", e.target.value)}
                                    />
                                </div>
                                <div className="col">
                                    <label>Color del ícono</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        value={b.icon_color}
                                        onChange={e => handleBotonEdit(i, "icon_color", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="row mt-2">
                                <div className="col">
                                    <label>Color del borde</label>
                                    <input
                                        type="color"
                                        className="form-control form-control-color"
                                        value={b.borde_color}
                                        onChange={e => handleBotonEdit(i, "borde_color", e.target.value)}
                                    />
                                </div>

                                <div className="col">
                                    <label>Grosor del borde</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min="0"
                                        max="15"
                                        value={b.borde_grosor}
                                        onChange={e => handleBotonEdit(i, "borde_grosor", e.target.value)}
                                    />
                                </div>
                            </div>


                            {!b.fijo && (
                                <button
                                    className="btn btn-sm btn-outline-danger mt-2"
                                    onClick={() => eliminarBoton(i)}
                                >
                                    <i className="bi bi-x-circle" /> Eliminar
                                </button>
                            )}

                            <div className="d-flex gap-2 mb-2">
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => moverBotonArriba(i)}
                                    disabled={i === 0}
                                >
                                    <i className="bi bi-arrow-up" /> Subir
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => moverBotonAbajo(i)}
                                    disabled={i === botones.length - 1}
                                >
                                    <i className="bi bi-arrow-down" /> Bajar
                                </button>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <hr />
            <h3 className="mb-4">Agregar nuevo botón</h3>
            <div className="mb-2">
                <input
                    name="texto"
                    placeholder="Texto"
                    className="form-control"
                    value={nuevoBoton.texto}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-2">
                <input
                    name="url"
                    placeholder="URL"
                    className="form-control"
                    value={nuevoBoton.url}
                    onChange={handleInputChange}
                />
            </div>
            <div className="mb-2">
                <label>Icono</label>
                <select
                    name="icono"
                    className="form-select"
                    value={nuevoBoton.icono}
                    onChange={handleInputChange}
                >
                    <option value="">-- Selecciona un icono --</option>
                    {iconosDisponibles.map(icono => (
                        <option key={icono.clase} value={icono.clase}>
                            {icono.nombre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="row mt-2">
                <div className="col">
                    <label>Color del fondo</label>
                    <input
                        type="color"
                        name="bg_color"
                        className="form-control form-control-color"
                        value={nuevoBoton.bg_color}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col">
                    <label>Color del texto</label>
                    <input
                        type="color"
                        name="text_color"
                        className="form-control form-control-color"
                        value={nuevoBoton.text_color}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="col">
                    <label>Color del ícono</label>
                    <input
                        type="color"
                        name="icon_color"
                        className="form-control form-control-color"
                        value={nuevoBoton.icon_color}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="row mt-2">
                <div className="col">
                    <label>Color del borde</label>
                    <input
                        type="color"
                        className="form-control form-control-color"
                        value={nuevoBoton.borde_color}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="col">
                    <label>Grosor del borde</label>
                    <input
                        className="form-control"
                        type="number"
                        min="0"
                        max="15"
                        value={nuevoBoton.borde_grosor}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <button className="btn btn-success mt-2" onClick={agregarBoton}>
                <i className="bi bi-plus-circle"></i> Agregar
            </button>
        </div>
    );
}

export default EditorBotones;

