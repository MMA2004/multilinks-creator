// src/utils/storagePaths.js

/**
 * Extrae la ruta interna del Storage a partir de una URL pública de Firebase Storage.
 * Ejemplo:
 *   URL: https://firebasestorage.googleapis.com/v0/b/tu-proyecto.appspot.com/o/imagenes%2Ffoto.jpg?alt=media&token=abc123
 *   Retorno: "imagenes/foto.jpg"
 */
export function extraerPathDesdeURL(url) {
    try {
        if (!url) return null;
        const decoded = decodeURIComponent(url);

        // Buscar después de "/o/"
        const match = decoded.match(/\/o\/([^?]+)/);
        if (match && match[1]) {
            return match[1]; // ruta interna en Storage
        }
        return null;
    } catch (e) {
        console.error("Error extrayendo path desde URL:", e);
        return null;
    }
}
