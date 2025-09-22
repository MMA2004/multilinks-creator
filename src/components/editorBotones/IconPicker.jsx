import { useMemo, useState } from "react";
import styles from "./IconPicker.module.css";

/**
 * Muestra una cuadrícula con íconos de Bootstrap Icons.
 * - value: string con la clase (p. ej. "bi-whatsapp" o "bi bi-whatsapp")
 * - onChange: (string) => void
 */
export default function IconPicker({ value = "", onChange }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState("");

    const ICONS = useMemo(
        () => [
            // Sociales / mensajería
            { nombre: "WhatsApp", clase: "bi-whatsapp" },
            { nombre: "Instagram", clase: "bi-instagram" },
            { nombre: "Facebook", clase: "bi-facebook" },
            { nombre: "X (Twitter)", clase: "bi-twitter-x" },
            { nombre: "Telegram", clase: "bi-telegram" },
            { nombre: "Messenger", clase: "bi-messenger" },
            { nombre: "YouTube", clase: "bi-youtube" },
            { nombre: "TikTok", clase: "bi-tiktok" },
            { nombre: "LinkedIn", clase: "bi-linkedin" },
            { nombre: "GitHub", clase: "bi-github" },
            { nombre: "Spotify", clase: "bi-spotify" },
            { nombre: "Discord", clase: "bi-discord" },

            // Contacto / acciones
            { nombre: "Teléfono", clase: "bi-telephone" },
            { nombre: "Llamar", clase: "bi-telephone-outbound" },
            { nombre: "Correo", clase: "bi-envelope" },
            { nombre: "Abrir correo", clase: "bi-envelope-open" },
            { nombre: "Ubicación", clase: "bi-geo-alt-fill" },
            { nombre: "Mapa", clase: "bi-map" },
            { nombre: "Web", clase: "bi-globe" },
            { nombre: "Enlace", clase: "bi-link-45deg" },
            { nombre: "Compartir", clase: "bi-share" },
            { nombre: "Lista", clase: "bi-list" },
            { nombre: "Check", clase: "bi-check2-circle" },
            { nombre: "Carrito", clase: "bi-cart" },
            { nombre: "Tarjeta", clase: "bi-credit-card" },
            { nombre: "Calendario", clase: "bi-calendar-event" },
            { nombre: "Alerta", clase: "bi-exclamation-triangle" },
            { nombre: "Documento", clase: "bi-file-earmark-text" },
            { nombre: "PDF", clase: "bi-filetype-pdf" },
            { nombre: "Imagen", clase: "bi-image" },
            { nombre: "Galería", clase: "bi-images" },
            { nombre: "UI Checks", clase: "bi-ui-checks" },
            { nombre: "Formulario", clase: "bi-ui-radios" },

            // Flechas / navegación
            { nombre: "Flecha derecha", clase: "bi-arrow-right" },
            { nombre: "Flecha izquierda", clase: "bi-arrow-left" },
            { nombre: "Flecha arriba", clase: "bi-arrow-up" },
            { nombre: "Flecha abajo", clase: "bi-arrow-down" },
            { nombre: "Abrir en nueva", clase: "bi-box-arrow-up-right" },

            // Marcas / estados
            { nombre: "Éxito", clase: "bi-check-circle" },
            { nombre: "Favorito", clase: "bi-star" },
            { nombre: "Corazón", clase: "bi-heart" },
        ],
        []
    );

    const valueClass = value?.includes("bi ") ? value.split(" ").pop() : value;
    const selected = ICONS.find((i) => i.clase === valueClass) || null;

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return ICONS;
        return ICONS.filter(
            (i) =>
                i.nombre.toLowerCase().includes(t) ||
                i.clase.toLowerCase().includes(t)
        );
    }, [q, ICONS]);

    const handlePick = (clase) => {
        onChange?.(clase);  // guardamos solo "bi-xxx"
        setOpen(false);
    };

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen((o) => !o)}
            >
        <span className={styles.preview}>
          {selected ? <i className={`bi ${selected.clase}`} /> : <i className="bi bi-app" />}
        </span>
                <span className={styles.triggerText}>
          {selected ? `${selected.nombre}` : "Elegir icono"}
        </span>
                <i className="bi bi-caret-down-fill" />
            </button>

            {open && (
                <div className={styles.panel}>
                    <div className={styles.header}>
                        <input
                            className={styles.search}
                            placeholder="Buscar: whatsapp, link, mail..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            autoFocus
                        />
                        <button className={styles.clear} onClick={() => setQ("")} title="Limpiar">
                            <i className="bi bi-trash3-fill" />
                        </button>
                    </div>

                    <div className={styles.grid}>
                        {filtered.map((icon) => (
                            <button
                                key={icon.clase}
                                type="button"
                                className={`${styles.item} ${icon.clase === valueClass ? styles.active : ""}`}
                                onClick={() => handlePick(icon.clase)}
                                title={`${icon.nombre} (${icon.clase})`}
                            >
                                <i className={`bi ${icon.clase}`} />
                                <span>{icon.nombre}</span>
                            </button>
                        ))}
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.cancel} onClick={() => setOpen(false)}>
                            Cerrar
                        </button>
                        {selected && (
                            <div className={styles.selectedInfo}>
                                <i className={`bi ${selected.clase}`} />
                                <code>{selected.clase}</code>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
