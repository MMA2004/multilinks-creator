import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useAdmin } from "../../hooks/useAdmin.js";

export default function Panel() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const isAdmin = useAdmin();

    if (!usuario) return null;

    const accionesAdmin = [
        {
            title: "Crear multilink",
            desc: "Genera un multilink desde cero para un cliente.",
            icon: "bi-magic",
            onClick: () => navigate("/crear-multilink"),
        },
        {
            title: "Ver mis Multilinks",
            desc: "Lista, edita y consulta estadísticas.",
            icon: "bi-collection",
            onClick: () => navigate("/mis-multilinks"),
        },
    ];

    const accionesUsuario = [
        {
            title: "Registrar Multilink",
            desc: "Asocia tu multilink a tu cuenta con una clave.",
            icon: "bi-bookmark-plus",
            onClick: () => navigate("/registrar-multilink"),
        },
        {
            title: "Ver mis Multilinks",
            desc: "Lista, edita y consulta estadísticas.",
            icon: "bi-collection",
            onClick: () => navigate("/mis-multilinks"),
        },
    ];

    const acciones = isAdmin ? accionesAdmin : accionesUsuario;

    return (
        <div className="panel-root">
            <style>{`
        .panel-root{
          min-height:100vh; width:100vw; padding:24px; box-sizing:border-box;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6);
          background-size:180% 180%; animation: gradientMove 12s ease infinite;
        }
        @keyframes gradientMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        .card {
          width:100%; max-width: 900px; color:#fff; padding:28px; border-radius: 22px;
          background: rgba(255,255,255,.10); border:1px solid rgba(255,255,255,.25);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
        }
        .header { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
        .hello { display:flex; align-items:center; gap:12px; }
        .badge { width:44px; height:44px; border-radius: 12px; display:grid; place-items:center; background: rgba(255,255,255,.15); border:1px solid rgba(255,255,255,.25); font-weight:800; }
        .title { font-size: clamp(22px, 4vw, 28px); font-weight:800; line-height:1.1; }
        .role { opacity:.9; font-size: 13px; }
        .grid { display:grid; gap:16px; margin-top: 18px; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); }
        .action { position:relative; padding:16px; border-radius:16px; text-align:left; cursor:pointer;
          background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.20);
          transition: transform .15s ease, box-shadow .15s ease, background .2s ease;
        }
        .action:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.28); }
        .action .icon { font-size: 22px; margin-bottom: 10px; display:inline-block; }
        .action .act-title { font-weight: 800; margin-bottom: 6px; }
        .action .act-desc { opacity: .9; font-size: 14px; }
        .footer { margin-top: 22px; opacity: .9; font-size: 12px; }
        .pill { padding:6px 10px; border-radius:999px; background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.22); font-size:12px; margin-left:8px; }
      `}</style>

            <div className="card">
                <div className="header">
                    <div className="hello">
                        <div className="badge">GM</div>
                        <div>
                            <div className="title">Bienvenido{usuario?.email ? ", " : ""}{usuario?.email}</div>
                            <div className="role">Rol: {isAdmin ? "Administrador" : "Usuario"}</div>
                        </div>
                    </div>
                </div>

                <div className="grid">
                    {acciones.map((a) => (
                        <button key={a.title} className="action" onClick={a.onClick}>
                            <i className={`bi ${a.icon} icon`} aria-hidden></i>
                            <div className="act-title">{a.title}</div>
                            <div className="act-desc">{a.desc}</div>
                        </button>
                    ))}
                </div>

                <div className="footer">Powered by <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer" style={{color:'#fff', textDecoration:'underline', textUnderlineOffset: '3px'}}>Gibra Company</a></div>
            </div>
        </div>
    );
}
