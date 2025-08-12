export async function eliminarCarpetaMultilink(slug) {
    const res = await fetch(`https://api.gibracompany.com/api/multilinks/${encodeURIComponent(slug)}`, {
        method: "DELETE",
        headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
    });
    if (!res.ok) {
        const msg = await res.text().catch(() => "Error eliminando carpeta");
        throw new Error(msg);
    }
    return true;
}