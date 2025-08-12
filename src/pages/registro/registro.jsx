import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../../services/firebase.js";

export default function Registro() {
    const [correo, setCorreo] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const navigate = useNavigate();

    const registrarUsuario = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, correo.trim(), clave);
            navigate("/panel");
        } catch (err) {
            console.error(err);
            setError("Error al registrar el usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-root">
            <style>{`
        .registro-root {
          min-height: 100vh; width: 100vw; display: grid; place-items: center; padding: 24px;
          background: linear-gradient(120deg, #0ea5e9, #8b5cf6, #14b8a6);
          background-size: 180% 180%; animation: gradientMove 12s ease infinite;
          box-sizing: border-box;
        }
        @keyframes gradientMove {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        .card {
          width: 100%; max-width: 480px; padding: 28px; border-radius: 20px; color: #fff;
          background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 18px 50px rgba(0,0,0,0.25);
        }
        .title { font-size: clamp(22px, 3.5vw, 28px); font-weight: 800; margin-bottom: 4px; }
        .subtitle { opacity: .9; margin-bottom: 18px; }
        form { display: grid; gap: 14px; }
        .field { display: grid; gap: 8px; }
        .label { font-size: 12px; opacity: .9; }
        .input {
          width: 100%; border-radius: 12px; padding: 12px 14px; font-size: 14px; color: #0f172a;
          background: rgba(255,255,255,0.95); border: 1px solid rgba(15, 23, 42, .08);
          outline: none; transition: box-shadow .15s ease, border-color .15s ease;
        }
        .input:focus { box-shadow: 0 0 0 4px rgba(255,255,255,0.35); border-color: rgba(255,255,255,0.6); }
        .input-wrap { position: relative; }
        .toggle-pwd {
          position: absolute; right: 10px; top: 0; bottom: 0; margin: auto 0;
          height: 100%; display: flex; align-items: center; background: transparent;
          border: 0; cursor: pointer; font-weight: 700; color: #0f172a; opacity: .7;
        }
        .btn {
          appearance: none; border: 0; border-radius: 12px; padding: 12px 16px; font-weight: 700;
          background: #111827; color: #fff; cursor: pointer; display: inline-flex; align-items:center; justify-content:center;
          transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
          box-shadow: 0 10px 22px rgba(0,0,0,0.25);
        }
        .btn:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(0,0,0,0.3); }
        .btn[disabled] { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }
        .error { background: rgba(239,68,68,.18); border: 1px solid rgba(239,68,68,.55);
          color: #fee2e2; padding: 10px 12px; border-radius: 12px; font-size: 14px; }
        .links { display:flex; justify-content: space-between; gap: 12px; margin-top: 8px; font-size: 13px; }
        .link a { color:#fff; text-decoration: underline; text-underline-offset: 3px; }
        .brand { display:flex; align-items:center; gap:10px; margin-bottom: 8px; }
        .brand-badge { width: 40px; height: 40px; border-radius: 12px; display:grid; place-items:center; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); font-weight: 800; }
        .footer { margin-top: 16px; opacity: .9; font-size: 12px; }
        a { color: #fff; }
        .input-wrap { position: relative; }
      `}</style>

            <div className="card">
                <div className="brand">
                    <div className="brand-badge">GM</div>
                    <div>
                        <div className="title">Crear cuenta</div>
                        <div className="subtitle">Regístrate para comenzar a usar Gibra Multilinks.</div>
                    </div>
                </div>

                {error && <div className="error" role="alert">{error}</div>}

                <form onSubmit={registrarUsuario}>
                    <div className="field">
                        <label className="label" htmlFor="email">Correo</label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="field">
                        <label className="label" htmlFor="password">Contraseña</label>

                        <div className="input-wrap">
                            <input
                                id="password"
                                className="input"
                                type={showPwd ? "text" : "password"}
                                placeholder="••••••••"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                            <button type="button" className="toggle-pwd" onClick={() => setShowPwd(s => !s)}>
                                {showPwd ? "Ocultar" : "Ver"}
                            </button>
                        </div>
                    </div>


                    <button className="btn" type="submit" disabled={loading}>
                        {loading ? "Registrando..." : "Registrarse"}
                    </button>

                    <div className="links">
                        <div className="link">
                            <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
                        </div>
                        <div className="link">
                            <Link to="/">Volver al inicio</Link>
                        </div>
                    </div>
                </form>

                <div className="footer">Powered by <a href="https://www.gibracompany.com/" target="_blank" rel="noreferrer">Gibra Company</a></div>
            </div>
        </div>
    );
}
