import { useState } from 'react';
import { generarMultilink } from '../services/api';

export default function Home() {
    const [form, setForm] = useState({
        nombre: '',
        plantilla: 'plantilla_comercial',
        botones: [],
        url: '',
        mostrar_boton_contacto: false,
    });

    const [resultado, setResultado] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await generarMultilink(form);
            setResultado(res.url);
        } catch (err) {
            console.error(err);
            alert("Hubo un error al generar la página");
        }
    };

    return (
        <div>
            <h1>Generador de Páginas Multilink</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="URL personalizada"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
                {/* Agrega más campos según necesites */}
                <button type="submit">Generar</button>
            </form>

            {resultado && <p>Tu página fue generada: <a href={resultado} target="_blank">{resultado}</a></p>}
        </div>
    );
}
