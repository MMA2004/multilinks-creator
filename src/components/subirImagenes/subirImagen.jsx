import { useEffect, useState, useRef } from "react";
import { storage } from "../../services/firebase.js";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import styles from "./subirImagen.module.css";

/**
 * SubirImagen (Drag & Drop con Auto-Upload)
 * Props:
 * - urlInicial?: string
 * - carpeta?: string  (default: "imagenes")
 * - onUploadSuccess?: (url: string|null) => void
 * - aspectRatio?: string (Ej: "16/9", "1/1". Por defecto libre)
 */
function SubirImagen({ urlInicial = "", carpeta = "imagenes", onUploadSuccess }) {
    const [url, setUrl] = useState("");
    const [path, setPath] = useState("");
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

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

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await procesarArchivo(e.dataTransfer.files[0]);
        }
    };

    const handleChange = async (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            await procesarArchivo(e.target.files[0]);
        }
    };

    const procesarArchivo = async (archivo) => {
        if (!archivo.type.startsWith("image/")) {
            alert("Por favor, selecciona un archivo de imagen.");
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

    const eliminarImagen = async (e) => {
        e.stopPropagation(); // Evitar que haga clic en el input
        if (!path) {
            // Limpieza local si no hay path
            setUrl("");
            setPath("");
            onUploadSuccess?.(null);
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        try {
            setLoading(true);
            await deleteObject(ref(storage, path));
            setUrl("");
            setPath("");
            onUploadSuccess?.(null);
            if (inputRef.current) inputRef.current.value = "";
        } catch (error) {
            console.error("Error al eliminar la imagen:", error);
            alert("No se pudo eliminar la imagen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            {/* Si NO hay URL, mostramos la dropzone para subir */}
            {!url && (
                <div 
                    className={`${styles.dropzone} ${dragActive ? styles.dragActive : ""} ${loading ? styles.loadingState : ""}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className={styles.fileInput}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    
                    {loading ? (
                        <div className={styles.dropContent}>
                            <div className={styles.spinner}></div>
                            <p>Subiendo imagen...</p>
                        </div>
                    ) : (
                        <div className={styles.dropContent}>
                            <i className={`bi bi-cloud-arrow-up ${styles.uploadIcon}`}></i>
                            <p>Haz clic o arrastra una imagen aquí</p>
                            <span className={styles.formatHint}>PNG, JPG, GIF, WebP</span>
                        </div>
                    )}
                </div>
            )}

            {/* Si HAY URL, mostramos la previsualización */}
            {url && (
                <div className={styles.previewContainer}>
                    <div className={styles.imageWrapper}>
                        <img src={url} alt="Vista previa" className={styles.previewImg} />
                        {loading && (
                            <div className={styles.overlayLoading}>
                                <div className={styles.spinner}></div>
                            </div>
                        )}
                        {!loading && (
                            <div className={styles.overlayActions}>
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={eliminarImagen}
                                    title="Eliminar imagen"
                                >
                                    <i className="bi bi-trash3-fill"></i>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

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

