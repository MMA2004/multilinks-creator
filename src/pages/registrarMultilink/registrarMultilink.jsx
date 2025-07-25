import { useState } from "react";
import { db } from "../../services/firebase";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc
} from "firebase/firestore";
import {useAuth} from "../../context/AuthContext.jsx";
// Asegúrate de tener este hook o pasar el usuario como prop

function RegistrarMultilink() {
    const [url, setUrl] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");
    const { usuario } = useAuth(); // o úsalo desde contexto si lo manejas así

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setExito("");

        if (!usuario) {
            setError("Debes iniciar sesión.");
            return;
        }

        try {
            const q = query(
                collection(db, "multilinks"),
                where("url", "==", url),
                where("clave_edicion", "==", clave)
            );

            const snap = await getDocs(q);

            if (!snap.empty) {
                const docSnap = snap.docs[0];
                const data = docSnap.data();

                if (data.uid) {
                    setError("Este multilink ya está registrado por otro usuario.");
                    return;
                }

                const docRef = doc(db, "multilinks", docSnap.id);
                await updateDoc(docRef, {
                    uid: usuario.uid, // se asocia al usuario autenticado
                });

                setExito("Multilink registrado correctamente.");
                setUrl("");
                setClave("");
            } else {
                setError("URL o clave incorrecta.");
            }
        } catch (err) {
            console.error(err);
            setError("Ocurrió un error al registrar el multilink.");
        }
    };

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Registrar un Multilink</h2>
            <form onSubmit={handleSubmit}>
                <input
                    placeholder="URL del multilink"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                /><br />
                <input
                    type="password"
                    placeholder="Clave de edición"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                /><br />
                <button type="submit">Registrar</button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {exito && <p style={{ color: "green" }}>{exito}</p>}
        </div>
    );
}

export default RegistrarMultilink;
