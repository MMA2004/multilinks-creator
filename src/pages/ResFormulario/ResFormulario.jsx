import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import * as XLSX from "xlsx";

function ResFormulario() {
    const { url } = useParams();
    const [respuestas, setRespuestas] = useState([]);
    const [campos, setCampos] = useState([]);

    useEffect(() => {
        const cargarRespuestas = async () => {
            try {
                const res = await fetch(`https://api.gibracompany.com/api/ver-formularios/${url}.gibracompany.com`);
                const data = await res.json();
                setRespuestas(data);

                // Obtener todos los nombres de campos únicos
                const todosLosCampos = new Set();
                data.forEach((r) => {
                    Object.keys(r.respuestas || {}).forEach((campo) => todosLosCampos.add(campo));
                });
                setCampos(Array.from(todosLosCampos));
            } catch (error) {
                console.error("Error cargando respuestas:", error);
            }
        };

        cargarRespuestas();
    }, [url]);

    const exportarDatos = (formato) => {
        if (respuestas.length === 0) return;

        const datos = respuestas.map((r) => {
            const fila = {};
            campos.forEach((campo) => {
                fila[campo] = r.respuestas?.[campo] || "";
            });
            fila["Fecha de envío"] = new Date(r.timestamp).toLocaleString();
            return fila;
        });

        const hoja = XLSX.utils.json_to_sheet(datos);
        const libro = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(libro, hoja, "Respuestas");

        const nombreArchivo = `respuestas_${url}.${formato === "excel" ? "xlsx" : "csv"}`;
        if (formato === "excel") {
            XLSX.writeFile(libro, nombreArchivo);
        } else if (formato === "csv") {
            XLSX.writeFile(libro, nombreArchivo, { bookType: "csv" });
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Respuestas del formulario</h2>

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => exportarDatos("csv")} style={{ marginRight: "1rem" }}>
                    Exportar como CSV
                </button>
                <button onClick={() => exportarDatos("excel")}>
                    Exportar como Excel
                </button>
            </div>

            {respuestas.length === 0 ? (
                <p>No hay respuestas aún.</p>
            ) : (
                <table border="1" cellPadding="10" style={{ borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        {campos.map((campo) => (
                            <th key={campo}>{campo}</th>
                        ))}
                        <th>Fecha de envío</th>
                    </tr>
                    </thead>
                    <tbody>
                    {respuestas.map((respuesta, i) => (
                        <tr key={i}>
                            {campos.map((campo) => (
                                <td key={campo}>
                                    {respuesta.respuestas?.[campo] || ""}
                                </td>
                            ))}
                            <td>{new Date(respuesta.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ResFormulario;
