export const generarMultilink = async (datos) => {
    const res = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
        },
        body: JSON.stringify(datos)
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.error || 'Error generando página');
    }

    return await res.json();
};
