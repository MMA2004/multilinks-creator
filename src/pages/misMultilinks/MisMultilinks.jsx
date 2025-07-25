import { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";

function MisMultilinks() {
    const [multilinks, setMultilinks] = useState([]);
    const [error, setError] = useState("");
    const { usuario } = useAuth(); // o pásalo como prop/contexto
    const navigate = useNavigate();

    useEffect(() => {
        const cargarMultilinks = async () => {
            if (!usuario) return;

            try {
                const q = query(
                    collection(db, "multilinks"),
                    where("uid", "==", usuario.uid)
                );
                const snap = await getDocs(q);
                const datos = snap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMultilinks(datos);
            } catch (err) {
                console.error(err);
                setError("Error al cargar tus multilinks.");
            }
        };

        cargarMultilinks();
    }, [usuario]);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Mis Multilinks</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {multilinks.length === 0 && <p>No tienes multilinks registrados.</p>}

            <ul>
                {multilinks.map((m) => (
                    <li key={m.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #ccc" }}>
                        <strong>{m.url}</strong><br />
                        <button onClick={() => navigate(`/editar/${m.id}`)}>Editar</button>
                        <button onClick={() => navigate(`/estadisticas/${m.url}`)}>Ver estadísticas</button>
                        <button onClick={() => navigate(`/respuestas/${m.url}`)}>Ver respuestas</button>
                        <a
                            href={`https://${m.url}.gibracompany.com`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ marginLeft: "1rem" }}
                        >
                            Ver Página
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default MisMultilinks;
