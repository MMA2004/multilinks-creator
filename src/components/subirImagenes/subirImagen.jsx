import { useEffect, useState } from "react";
import { storage } from "../../services/firebase.js";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import styles from "./SubirImagen.module.css";

/**
 * SubirImagen
 * Props:
 * - urlInicial?: string
 * - carpeta?: string  (default: "imagenes")
 * - onUploadSuccess?: (url: string|null) => void
 * - onClickAdicional?: () => void
 */
function SubirImagen({ urlInicial = "", carpeta = "imagenes", onUploadSuccess, onClickAdicional }) {
    const [archivo, setArchivo] = useState(null);
    const [url, setUrl] = useState("");
    const [path, setPath] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (urlInicial) {
            setUrl(urlInicial);
            const pathExtraido = extraerPathDesdeURL(urlInicial);
            if (pathExtraido) setPath(pathExtraido);
        } else {
            setUrl("");
            setPath("");
        }
    }, [urlInicial]);

    const handleArchivoChange = (e) => {
        const f = e.target.files?.[0] || null;
        setArchivo(f);
    };

    const subirImagen = async () => {
        if (!archivo) {
            alert("Selecciona una imagen");
            return;
        }
        try {
            setLoading(true);
            const nombreSanit = archivo.name.replace(/\s+/g, "_");
            const nombreUnico = `${Date.now()}-${nombreSanit}`;
            const rutaStorage = `${carpeta}/${nombreUnico}`;
            const referencia = ref(storage, rutaStorage);
            await uploadBytes(referencia, archivo);
            const urlDescarga = await getDownloadURL(referencia);
            setUrl(urlDescarga);
            setPath(rutaStorage);
            onUploadSuccess?.(urlDescarga);
        } catch (e) {
            console.error(e);
            alert("No se pudo subir la imagen.");
        } finally {
            setLoading(false);
        }
    };

    const eliminarImagen = async () => {
        if (!path) return;
        try {
            setLoading(true);
            await deleteObject(ref(storage, path));
            setUrl("");
            setArchivo(null);
            setPath("");
            onUploadSuccess?.(null);
        } catch (error) {
            console.error("Error al eliminar la imagen:", error);
            alert("No se pudo eliminar la imagen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.row}>
                <label className={styles.file}>
                    <input
                        type="file"
                        onChange={handleArchivoChange}
                        accept="image/*"
                        aria-label="Seleccionar imagen"
                    />
                    <span className={styles.fileLabel}>
            <i className="bi bi-image" aria-hidden />
                        {archivo ? archivo.name : "Seleccionar imagen"}
          </span>
                </label>

                <button
                    className={styles.btn}
                    onClick={() => {
                        subirImagen();
                        onClickAdicional?.();
                    }}
                    disabled={loading}
                    type="button"
                >
                    {loading ? "Subiendo…" : "Subir"}
                </button>
            </div>

            {url && (
                <div className={styles.preview}>
                    <div className={styles.imgwrap}>
                        <img src={url} alt="Imagen subida" />
                    </div>
                    <button
                        className={`${styles.btn} ${styles.danger}`}
                        onClick={eliminarImagen}
                        disabled={loading}
                        type="button"
                    >
                        {loading ? "Eliminando…" : "Eliminar imagen"}
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Reconstruye el path de Storage desde una URL pública de Firebase:
 * - Formato típico: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<path>%2Farchivo?alt=media&token=...
 */
function extraerPathDesdeURL(url) {
    try {
        const urlObj = new URL(url);
        const afterO = urlObj.pathname.split("/o/")[1] || "";
        const beforeQuery = afterO.split("?")[0];
        return decodeURIComponent(beforeQuery);
    } catch {
        return "";
    }
}

export default SubirImagen;
