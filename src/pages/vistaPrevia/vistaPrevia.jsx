// src/pages/VistaPrevia.jsx
import React from 'react';
import './vistaPrevia.css';

function VistaPrevia({ data }) {
    const {
        fondo = '#ffffff',
        imagen = '',
        tamano_foto = '',
        titulo = '',
        borde = '',
        color_titulo = '#000000',
        tamano_titulo = '24px',
        mt_titulo = '10px',
        mb_titulo = '10px',
        subtitulo = '',
        color_subtitulo = '#555555',
        tamano_subtitulo = '18px',
        mt_subtitulo = '5px',
        mb_subtitulo = '10px',
        color_footer = '#888888',
        botones = [],
        mostrar_boton_contacto = false,
        contacto_bg = '#3aabd4',
        contacto_color = 'white',
        contacto_borde_grosor = '0',
        contacto_borde_color = '#000000',
        fuente_titulo = '',
        fuente_subtitulo = '',
        fuente_general = '',
        plantilla = 'plantilla_comercial',
        imagen_fondo = '',
    } = data;

    // Función para cargar fuentes web dinámicamente
    const cargarFuenteWeb = (fuente) => {
        if (!fuente || ['Arial', 'Helvetica', 'Georgia', 'Times New Roman'].includes(fuente)) {
            return; // No cargar fuentes del sistema
        }

        const linkId = `font-${fuente.replace(/\s+/g, '-').toLowerCase()}`;
        if (document.getElementById(linkId)) {
            return; // Ya está cargada
        }

        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${fuente.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
        document.head.appendChild(link);
    };

    // Cargar las fuentes cuando cambien
    React.useEffect(() => {
        cargarFuenteWeb(fuente_titulo);
        cargarFuenteWeb(fuente_subtitulo);
        cargarFuenteWeb(fuente_general);
    }, [fuente_titulo, fuente_subtitulo, fuente_general]);

    const backgroundStyle = imagen_fondo
        ? { backgroundImage: `url(${imagen_fondo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { background: fondo };

    return (
        <div
            className={`vista-previa ${plantilla}`}
            style={backgroundStyle}
        >
            <div className="container">
                {imagen && <img src={imagen} alt="Foto de perfil" className="profile-pic" style={{ width: tamano_foto, borderRadius: borde }} />}
                <h2
                    style={{
                        color: color_titulo,
                        fontSize: tamano_titulo,
                        marginBottom: mb_titulo,
                        marginTop: mt_titulo,
                        fontFamily: fuente_titulo
                    }}
                >
                    {titulo}
                </h2>
                <h3
                    style={{
                        color: color_subtitulo,
                        fontSize: tamano_subtitulo,
                        marginBottom: mb_subtitulo,
                        marginTop: mt_subtitulo,
                        fontFamily: fuente_subtitulo
                    }}
                >
                    {subtitulo}
                </h3>

                <div className="social-buttons">
                    {botones.map((boton, index) => {
                        const tipoActual = boton.tipo || "enlace";

                        // Mapear tipos antiguos a "enlace"
                        const esBotonClasico = ["enlace", "normal", "whatsapp", "correo", "ResFormulario", ""].includes(tipoActual);

                        if (esBotonClasico) {
                            const isCircular = boton.forma === "circular";
                            return (
                                <div
                                    key={index}
                                    className={`boton ${isCircular ? 'boton-circular' : ''}`}
                                    onClick={() => window.open(boton.url, '_blank')}
                                    style={{
                                        backgroundColor: boton.bg_color || 'white',
                                        color: boton.text_color,
                                        border: `${boton.borde_grosor || 0}px solid ${boton.borde_color || '#000'}`,
                                        fontFamily: fuente_general,
                                        marginBottom: '15px'
                                    }}
                                >
                                    <i
                                        className={`bi ${boton.icono}`}
                                        style={{ color: boton.icon_color }}
                                    ></i>
                                    {!isCircular && <span>{boton.texto}</span>}
                                </div>
                            );
                        }

                        if (tipoActual === "youtube") {
                            let yt_url = boton.url || "";
                            if (yt_url.includes("watch?v=")) yt_url = yt_url.replace("watch?v=", "embed/");
                            else if (yt_url.includes("youtu.be/")) yt_url = yt_url.replace("youtu.be/", "youtube.com/embed/");

                            return (
                                <div key={index} style={{
                                    marginBottom: '15px',
                                    borderRadius: `${boton.borde_grosor || 0}px`,
                                    overflow: 'hidden',
                                    border: `${boton.borde_grosor || 0}px solid ${boton.borde_color || 'transparent'}`,
                                    width: `${boton.ancho_video || 100}%`,
                                    margin: '0 auto 15px auto',
                                    aspectRatio: '16/9'
                                }}>
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={yt_url}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            );
                        }

                        if (tipoActual === "mapa") {
                            // Extraer el enlace src si el usuario pegó el iframe completo por error
                            let map_url = boton.url || "";
                            if (map_url.includes("<iframe")) {
                                const match = map_url.match(/src="([^"]+)"/);
                                if (match) map_url = match[1];
                            }
                            
                            const isGoogleMaps = map_url.includes("google.com/maps");
                            const isEmbed = map_url.includes("embed") || map_url.includes("pb=");
                            const isInvalidMap = isGoogleMaps && !isEmbed;

                            return (
                                <div key={index} style={{
                                    marginBottom: '15px',
                                    borderRadius: `${boton.borde_grosor || 0}px`,
                                    overflow: 'hidden',
                                    border: `${boton.borde_grosor || 0}px solid ${boton.borde_color || 'transparent'}`,
                                    width: `${boton.ancho_video || 100}%`,
                                    height: `${boton.alto_mapa || 300}px`,
                                    margin: '0 auto 15px auto'
                                }}>
                                    {map_url && !isInvalidMap ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={map_url}
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        ></iframe>
                                    ) : (
                                        <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f0f0f0', color: '#666', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                            <i className="bi bi-geo-alt" style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}></i>
                                            {isInvalidMap ? (
                                                <span style={{ fontSize: '13px', color: '#d9534f' }}>Enlace incorrecto. En Google Maps ve a <b>Compartir</b> y elige <b>Insertar un mapa</b>.</span>
                                            ) : (
                                                <span style={{ fontSize: '13px' }}>Añade la URL de inserción del mapa</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (tipoActual === "texto") {
                            return (
                                <div key={index} style={{
                                    marginBottom: '15px',
                                    textAlign: boton.alineacion || 'center',
                                    color: boton.text_color || '#000',
                                    fontSize: boton.tamano || '16px',
                                    fontFamily: fuente_general
                                }}>
                                    {boton.texto}
                                </div>
                            );
                        }

                        if (tipoActual === "seccion") {
                            return (
                                <div key={index} style={{
                                    marginBottom: '15px',
                                    textAlign: 'left',
                                    color: boton.text_color || '#ffffff',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    borderBottom: `2px solid ${boton.borde_color || '#ffffff'}`,
                                    paddingBottom: '5px',
                                    fontFamily: fuente_general
                                }}>
                                    {boton.texto}
                                </div>
                            );
                        }

                        if (tipoActual === "imagen") {
                            return (
                                <div key={index} style={{ marginBottom: '15px', textAlign: 'center' }}>
                                    {boton.url ? (
                                        <img
                                            src={boton.url}
                                            alt="Bloque de imagen"
                                            style={{
                                                maxWidth: '100%',
                                                borderRadius: `${boton.borde_grosor || 0}px`,
                                                border: `${boton.borde_grosor || 0}px solid ${boton.borde_color || 'transparent'}`
                                            }}
                                        />
                                    ) : (
                                        <div style={{ padding: '20px', background: '#f0f0f0', border: '1px dashed #ccc', borderRadius: `${boton.borde_grosor || 0}px` }}>
                                            <em>Sin imagen seleccionada</em>
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        return null;
                    })}
                </div>

                {mostrar_boton_contacto && (
                    <div style={{ textAlign: 'center', marginTop: '15px', marginBottom: '10px' }}>
                        <a href="#" download style={{ textDecoration: 'none', display: 'inline-block' }}>
                            <button
                                className="guardar"
                                style={{
                                    backgroundColor: contacto_bg,
                                    color: contacto_color,
                                    border: `${contacto_borde_grosor}px solid ${contacto_borde_color}`,
                                    fontFamily: fuente_general,
                                    borderRadius: '30px',
                                    padding: '10px 18px', // <- Bajamos de 25px a 18px para recortar los lados
                                    fontSize: '16px',
                                    margin: '0 auto',
                                    cursor: 'pointer',
                                    width: '200px'
                                }}
                            >
                                Guardar Contacto
                            </button>
                        </a>
                    </div>
                )}

                <footer style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '6px',               // Espacio ideal entre "Powered by" y "Gibra Company"
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: color_footer,
                    fontFamily: fuente_general,
                    fontSize: '14px',
                    width: 'max-content',     // <- Cambiado de '100%' a 'max-content' (solo ocupa lo que mide el texto)
                    margin: '0 auto',         // <- Centra el footer horizontalmente dentro de los 450px del .container
                    fontWeight: 'bold'
                }}>
                    <span>Powered by</span>
                    <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{ color: color_footer, fontFamily: fuente_general, textDecoration: 'none', fontWeight: 'bold' }}>
                        Gibra Company
                    </a>
                </footer>
            </div>
        </div>
    );
}

export default VistaPrevia;