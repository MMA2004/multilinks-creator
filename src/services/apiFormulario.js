export async function enviarFormularioAlServidor(url, respuestas) {
    try {
        const res = await fetch(`https://api.gibracompany.com/api/formulario/${url}.gibracompany.com`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`
            },
            body: JSON.stringify({ respuestas })
        });

        if (!res.ok) {
            throw new Error("Error al enviar ResFormulario");
        }

        return await res.json();
    } catch (err) {
        console.error("Error al enviar datos al servidor:", err);
        throw err;
    }
}