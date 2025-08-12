import { useNavigate } from "react-router-dom";

export default function Inicio() {
    const navigate = useNavigate();

    return (
        <div className="inicio-root">
            <style>{`
            .inicio-root {
            width: 100vw;              /* Ocupa todo el ancho de la ventana */
            min-height: 100vh;         /* Ocupa todo el alto de la ventana */
            display: flex;
            align-items: center;       /* Centrar vertical */
            justify-content: center;   /* Centrar horizontal */
            background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6);
            background-size: 180% 180%;
            animation: gradientMove 12s ease infinite;
            padding: 24px;
            box-sizing: border-box;    /* Para que el padding no rompa el tamaño */
          }
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        .card-glass {
          width: 100%;
          max-width: 760px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: #fff;
          padding: 32px;
        }
        .brand {
          display:flex; align-items:center; gap:14px; margin-bottom: 6px;
        }
        .brand-logo {
          width: 56px; height: 56px; border-radius: 14px; display:grid; place-items:center;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          font-weight: 800; letter-spacing: 0.5px;
        }
        .title { font-size: clamp(24px, 4vw, 36px); font-weight: 800; line-height: 1.1; }
        .subtitle { color: rgba(255,255,255,0.85); font-size: clamp(14px, 2.2vw, 18px); margin-top: 6px; }
        .cta {
          display:flex; gap:14px; flex-wrap:wrap; margin-top: 28px;
        }
        .btn-main {
          appearance: none; border: 0; cursor: pointer; border-radius: 14px; padding: 14px 18px;
          font-weight: 700; font-size: 16px; transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
          box-shadow: 0 8px 20px rgba(0,0,0,0.20);
          display:flex; align-items:center; gap:10px;
        }
        .btn-login { background: #111827; color: #fff; }
        .btn-login:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.28); }
        .btn-register { background: rgba(255,255,255,0.92); color: #111827; }
        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.28); background: #fff; }
        .meta-row { display:flex; gap: 16px; flex-wrap:wrap; margin-top: 22px; }
        .pill {
          padding: 8px 12px; border-radius: 999px; font-size: 12px; letter-spacing: 0.3px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22);
        }
        .features {
          display:grid; gap: 12px; margin-top: 22px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .feature {
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 16px; padding: 14px;
        }
        .footer {
          margin-top: 28px; opacity: 0.8; font-size: 12px; display:flex; align-items:center; gap:8px;
        }
        .footer a{ color:#fff; text-decoration: underline; text-underline-offset: 3px; }
        .icon { display:inline-flex; align-items:center; justify-content:center; }
      `}</style>

            <div className="card-glass">
                <div className="brand">
                    <div className="brand-logo" aria-hidden>
                        {/* Pon tu logo aquí si lo tienes */}
                        GM
                    </div>
                    <div>
                        <div className="title">Gibra Multilinks</div>
                        <div className="subtitle">Crea, personaliza y comparte tu página de enlaces en minutos.</div>
                    </div>
                </div>

                <div className="meta-row">
                    <span className="pill">⚡ Rápido de configurar</span>
                    <span className="pill">🎨 Personalización total</span>
                    <span className="pill">📊 Estadísticas integradas</span>
                </div>

                <div className="cta">
                    <button className="btn-main btn-login" onClick={() => navigate("/login")}>
                        <span className="icon bi bi-box-arrow-in-right" aria-hidden></span>
                        Iniciar sesión
                    </button>
                    <button className="btn-main btn-register" onClick={() => navigate("/registro")}>
                        <span className="icon bi bi-person-plus" aria-hidden></span>
                        Registrarse
                    </button>
                </div>

                <div className="features">
                    <div className="feature">🔗 Tu multilink con subdominio personalizado bajo Gibra.</div>
                    <div className="feature">🗂️ Formularios personalizables para tus clientes.</div>
                    <div className="feature">☁️ Hosting rápido y estable en el dominio de Gibra.</div>
                </div>

                <div className="footer">
                    Powered by
                    <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">
                        Gibra Company
                    </a>
                </div>
            </div>
        </div>
    );
}