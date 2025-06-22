import { useState } from "react";
import { storage } from "../../services/firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function SubirImagen({ onUploadSuccess }) {
    const [archivo, setArchivo] = useState(null);
    const [url, setUrl] = useState("");

    const handleArchivoChange = (e) => {
        setArchivo(e.target.files[0]);
    };

    const subirImagen = async () => {
        if (!archivo) return alert("Selecciona una imagen");

        const nombreUnico = `${Date.now()}-${archivo.name}`;
        const referencia = ref(storage, `imagenes/${nombreUnico}`);

        await uploadBytes(referencia, archivo);
        const urlDescarga = await getDownloadURL(referencia);

        setUrl(urlDescarga);
        if (onUploadSuccess) onUploadSuccess(urlDescarga);
    };

    return (
        <div>
            <input type="file" onChange={handleArchivoChange} />
            <button onClick={subirImagen}>Subir</button>
            {url && <img src={url} alt="Subida" width="200" />}
        </div>
    );
}

export default SubirImagen;
