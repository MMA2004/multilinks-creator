import {useEffect, useState} from "react";
import {storage} from "../../services/firebase.js";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";

function SubirImagen({ urlInicial = "", onUploadSuccess, onClickAdicional }) {
    const [archivo, setArchivo] = useState(null);
    const [url, setUrl] = useState("");
    const [path, setPath] = useState("");

    // Cargar imagen preexistente si viene del padre
    useEffect(() => {
        if (urlInicial) {
            setUrl(urlInicial);

            // Intentamos reconstruir el path si la imagen ya existía
            const pathExtraido = extraerPathDesdeURL(urlInicial);
            if (pathExtraido) {
                setPath(pathExtraido);
            }
        }
    }, [urlInicial]);

    const handleArchivoChange = (e) => {
        setArchivo(e.target.files[0]);
    };

    const subirImagen = async () => {
        if (!archivo) return alert("Selecciona una imagen");

        const nombreUnico = `${Date.now()}-${archivo.name}`;
        const rutaStorage = `imagenes/${nombreUnico}`;
        const referencia = ref(storage, rutaStorage);

        await uploadBytes(referencia, archivo);
        const urlDescarga = await getDownloadURL(referencia);

        setUrl(urlDescarga);
        setPath(rutaStorage);

        if (onUploadSuccess) onUploadSuccess(urlDescarga);
    };

    const eliminarImagen = async () => {
        if (!path) return;

        try {
            await deleteObject(ref(storage, path));
            setUrl("");
            setArchivo(null);
            setPath("");
            if (onUploadSuccess) onUploadSuccess(null);
        } catch (error) {
            console.error("Error al eliminar la imagen:", error);
            alert("No se pudo eliminar la imagen.");
        }
    };

    return (
        <div>
            <div className="d-flex align-items-center gap-3 mb-3">
                <input
                    type="file"
                    className="form-control"
                    onChange={handleArchivoChange}
                />
                <button className="btn btn-primary" onClick={() => {
                    subirImagen(); // tu lógica original
                    if (onClickAdicional) onClickAdicional(); // ejecuta guardarYGenerar también
                }}>
                    Subir
                </button>
            </div>

            {url && (
                <div className="text-center">
                    <img
                        src={url}
                        alt="Imagen subida"
                        className="img-thumbnail mb-2"
                        style={{ maxWidth: '200px' }}
                    />
                    <br />
                    <button className="btn btn-danger btn-sm" onClick={eliminarImagen}>
                        Eliminar imagen
                    </button>
                </div>
            )}
        </div>
    );
}

// Esta función intenta reconstruir el path a partir de la URL pública
function extraerPathDesdeURL(url) {
    try {
        const urlObj = new URL(url);
        return decodeURIComponent(urlObj.pathname.split("/o/")[1].split("?")[0]); // ejemplo: "imagenes/1722456900000-nombre.jpg"
    } catch {
        return "";
    }
}

export default SubirImagen;