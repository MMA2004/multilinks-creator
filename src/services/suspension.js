export async function setSuspension(slug, suspend) {
    const base = "https://api.gibracompany.com";
    const path = suspend ? "suspend" : "unsuspend";
    const url = `${base}/api/multilinks/${encodeURIComponent(slug)}/${path}`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "X-API-Key": import.meta.env.VITE_API_TOKEN,
        },
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Error ${res.status}: ${txt || "al cambiar estado"}`);
    }
    return res.json();
}

export async function getSuspensionStatus(slug) {
    const base = "https://api.gibracompany.com";
    const url = `${base}/api/multilinks/${encodeURIComponent(slug)}/status`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("No se pudo consultar estado");
    return res.json();
}