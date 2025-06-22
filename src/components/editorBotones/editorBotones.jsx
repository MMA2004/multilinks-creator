// src/components/EditorBotones.jsx
import { useState } from "react";

function EditorBotones({ botones, setBotones }) {
    const [nuevoBoton, setNuevoBoton] = useState({
        url: "",
        texto: "",
        icono: "",
        bg_color: "#ffffff",
        text_color: "#3aabd4",
        icon_color: "#3aabd4"
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoBoton({ ...nuevoBoton, [name]: value });
    };

    const agregarBoton = () => {
        setBotones([...botones, nuevoBoton]);
        setNuevoBoton({
            url: "",
            texto: "",
            icono: "",
            bg_color: "#ffffff",
            text_color: "#3aabd4",
            icon_color: "#3aabd4"
        });
    };

    const eliminarBoton = (index) => {
        const nuevos = [...botones];
        nuevos.splice(index, 1);
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
        { nombre: 'Enlace', clase: 'bi-link-45deg' }
    ];

    return (
        <div>
            <h3>Botones</h3>
            {botones.map((b, i) => (
                <div key={i} style={{ border: "1px solid #ccc", padding: "0.5rem", marginBottom: "0.5rem" }}>
                    <strong>{b.texto}</strong> - {b.url}
                    <button
                        style={{
                            marginLeft: "1rem",
                            width: "32px",
                            height: "32px",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            cursor: "pointer"
                        }}
                        onClick={() => eliminarBoton(i)}
                    >
                        <i className="bi bi-x-circle" style={{ fontSize: "1.2rem", color: "#d11a2a" }}></i>
                    </button>
                </div>
            ))}

            <h4>Agregar nuevo botón</h4>
            <input name="texto" placeholder="Texto" value={nuevoBoton.texto} onChange={handleInputChange} /><br />
            <input name="url" placeholder="URL" value={nuevoBoton.url} onChange={handleInputChange} /><br />
            <label>Icono</label>
            <select name="icono" value={nuevoBoton.icono} onChange={handleInputChange}>
                <option value="">-- Selecciona un icono --</option>
                {iconosDisponibles.map((icono) => (
                    <option key={icono.clase} value={icono.clase}>
                        {icono.nombre}
                    </option>
                ))}
            </select><br />
            {nuevoBoton.icono && (
                <div className="mt-2">
                    Vista previa: <i className={`bi ${nuevoBoton.icono}`} style={{ fontSize: "1.5rem", color: nuevoBoton.icon_color }}></i>
                </div>
            )}
            <label>Color fondo</label>
            <input type="color" name="bg_color" value={nuevoBoton.bg_color} onChange={handleInputChange} /><br />
            <label>Color texto</label>
            <input type="color" name="text_color" value={nuevoBoton.text_color} onChange={handleInputChange} /><br />
            <label>Color ícono</label>
            <input type="color" name="icon_color" value={nuevoBoton.icon_color} onChange={handleInputChange} /><br />
            <button onClick={agregarBoton}><i className="bi bi-plus-circle"></i> Agregar</button>
        </div>
    );
}

export default EditorBotones;
