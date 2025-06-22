import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import {db} from "../../services/firebase.js";

function AccederMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const q = query(
                collection(db, "multilinks"),
                where("url", "==", url),
                where("clave_edicion", "==", clave)
            );
            const snap = await getDocs(q);

            if (!snap.empty) {
                const docId = snap.docs[0].id;
                navigate(`/editar/${docId}`);
            } else {
                setError("URL o clave incorrecta.");
            }
        } catch (e) {
            setError("Error buscando el multilink.");
            console.error(e);
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Editar tu Multilink</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="URL de tu multilink"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                /><br />
                <input
                    type="password"
                    placeholder="Clave de edición"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                /><br />
                <button type="submit">Acceder</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </div>
    );
}

export default AccederMultilink;