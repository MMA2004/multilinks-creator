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

    return (
        <div
            className="vista-previa"
            style={{ background: fondo }}
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
                    {botones.map((boton, index) => (
                        <div
                            key={index}
                            className="boton"
                            onClick={() => window.open(boton.url, '_blank')}
                            style={{
                                backgroundColor: boton.bg_color || 'white',
                                color: boton.text_color,
                                border: `${boton.borde_grosor}px solid ${boton.borde_color}`,
                                fontFamily: fuente_general
                            }}
                        >
                            <i
                                className={`bi ${boton.icono}`}
                                style={{ color: boton.icon_color}}
                            ></i>
                            <span>{boton.texto}</span>
                        </div>
                    ))}
                </div>

                {mostrar_boton_contacto && (
                    <a href="#" download>
                        <button className="guardar" style={{ backgroundColor: contacto_bg, color: contacto_color, border: `${contacto_borde_grosor}px solid ${contacto_borde_color}`, fontFamily: fuente_general }}>
                            Guardar Contacto
                        </button>
                    </a>
                )}

                <footer style={{ color: color_footer, fontFamily: fuente_general }}>
                    Powered by <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{ color: color_footer, fontFamily: fuente_general }}>Gibra Company</a>
                </footer>
            </div>
        </div>
    );
}

export default VistaPrevia;