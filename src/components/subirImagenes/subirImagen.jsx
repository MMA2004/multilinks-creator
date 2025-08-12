import {useEffect, useState} from "react";
import {storage} from "../../services/firebase.js";
import {deleteObject, getDownloadURL, ref, uploadBytes} from "firebase/storage";

function SubirImagen({ urlInicial = "", onUploadSuccess, onClickAdicional }) {
    const [archivo, setArchivo] = useState(null);
    const [url, setUrl] = useState("");
    const [path, setPath] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (urlInicial) {
            setUrl(urlInicial);
            const pathExtraido = extraerPathDesdeURL(urlInicial);
            if (pathExtraido) setPath(pathExtraido);
        }
    }, [urlInicial]);

    const handleArchivoChange = (e) => {
        setArchivo(e.target.files[0] || null);
    };

    const subirImagen = async () => {
        if (!archivo) return alert("Selecciona una imagen");
        try {
            setLoading(true);
            const nombreUnico = `${Date.now()}-${archivo.name}`;
            const rutaStorage = `imagenes/${nombreUnico}`;
            const referencia = ref(storage, rutaStorage);
            await uploadBytes(referencia, archivo);
            const urlDescarga = await getDownloadURL(referencia);
            setUrl(urlDescarga);
            setPath(rutaStorage);
            onUploadSuccess && onUploadSuccess(urlDescarga);
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
            onUploadSuccess && onUploadSuccess(null);
        } catch (error) {
            console.error("Error al eliminar la imagen:", error);
            alert("No se pudo eliminar la imagen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="uix-root">
            <style>{styles}</style>

            <div className="uix-row">
                <label className="uix-file">
                    <input type="file" onChange={handleArchivoChange} accept="image/*" />
                    <span className="uix-file-label">
            <i className="bi bi-image" aria-hidden></i>
                        {archivo ? archivo.name : "Seleccionar imagen"}
          </span>
                </label>

                <button
                    className="uix-btn"
                    onClick={() => { subirImagen(); onClickAdicional && onClickAdicional(); }}
                    disabled={loading}
                >
                    {loading ? "Subiendo…" : "Subir"}
                </button>
            </div>

            {url && (
                <div className="uix-preview">
                    <div className="uix-imgwrap">
                        <img src={url} alt="Imagen subida" />
                    </div>
                    <button className="uix-btn uix-danger" onClick={eliminarImagen} disabled={loading}>
                        {loading ? "Eliminando…" : "Eliminar imagen"}
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
        return decodeURIComponent(urlObj.pathname.split("/o/")[1].split("?\"")[0]);
    } catch {
        return "";
    }
}

export default SubirImagen;

const styles = `
  .uix-root { color:#fff; }
  .uix-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

  /* File input bonito */
  .uix-file { position:relative; display:inline-block; }
  .uix-file input[type=file] { position:absolute; inset:0; opacity:0; cursor:pointer; }
  .uix-file-label { display:inline-flex; align-items:center; gap:10px; padding:10px 12px; border-radius:12px; background: rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.30); font-weight:700; }

  /* Botones */
  .uix-btn { appearance:none; border:0; border-radius:12px; padding:10px 16px; font-weight:700; background:#111827; color:#fff; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow: 0 10px 22px rgba(0,0,0,.25); }
  .uix-btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,.3); }
  .uix-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; box-shadow:none; }
  .uix-btn.uix-danger { background:#dc2626; }

  /* Preview */
  .uix-preview { margin-top:12px; text-align:center; }
  .uix-imgwrap { display:inline-block; padding:8px; border-radius:16px; background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.20); backdrop-filter: blur(6px); }
  .uix-imgwrap img { max-width:200px; border-radius:12px; display:block; }
`;