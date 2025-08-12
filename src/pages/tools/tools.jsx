// src/pages/AdminTools.jsx
import { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../../services/firebase.js";
import { useAdmin } from "../../hooks/useAdmin.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminTools() {
    const isAdmin = useAdmin();
    const navigate = useNavigate();
    const [running, setRunning] = useState(false);
    const [log, setLog] = useState([]);
    const [progress, setProgress] = useState({ done: 0, total: 0 });
    const { usuario } = useAuth();
    if (!isAdmin) return <div style={{padding:24,color:"crimson"}}>Acceso denegado.</div>;

    const append = (msg) => setLog((l) => [...l, msg]);

    const runMigration = async () => {
        if (running) return;
        setRunning(true);
        setLog([]);
        try {
            if (!usuario?.uid) {
                append("❌ Debes iniciar sesión con la cuenta ADMIN antes de migrar.");
                setRunning(false);
                return;
            }

            append(`Usando admin_uid = ${usuario.uid}`);
            const snap = await getDocs(collection(db, "multilinks"));
            const total = snap.size || 0;
            setProgress({ done: 0, total });

            if (total === 0) {
                append("No hay documentos para actualizar.");
                setRunning(false);
                return;
            }

            let batch = writeBatch(db);
            let inBatch = 0;
            let done = 0, updated = 0;

            for (const d of snap.docs) {
                const data = d.data();

                // Si ya está seteado, lo respetamos. Solo tocamos los que no tienen admin_uid/uid.
                const needsAdmin = !data.admin_uid;
                const needsUid   = data.uid === undefined; // crea el campo si no existe
                const currentMiembros = Array.isArray(data.miembros) ? data.miembros : [];
                const targetMiembros = Array.from(new Set([...(currentMiembros || []), usuario.uid]));

                if (needsAdmin || needsUid || JSON.stringify(targetMiembros) !== JSON.stringify(currentMiembros)) {
                    const patch = {};
                    if (needsAdmin) patch.admin_uid = usuario.uid;
                    if (needsUid)   patch.uid = null;
                    patch.miembros = targetMiembros;

                    batch.update(doc(db, "multilinks", d.id), patch);
                    inBatch++; updated++;
                }

                if (inBatch >= 400) {
                    await batch.commit();
                    append(`Commit parcial… (${done + 1} / ${total})`);
                    batch = writeBatch(db);
                    inBatch = 0;
                }

                done++;
                setProgress({ done, total });
            }

            if (inBatch > 0) await batch.commit();

            append(`✅ Migración terminada. Actualizados: ${updated} / ${total}`);
        } catch (e) {
            console.error(e);
            append(`❌ Error: ${e?.message || e}`);
        } finally {
            setRunning(false);
        }
    };


    return (
        <div style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#0ea5e9"}}>
            <div style={{width:"100%",maxWidth:720,background:"rgba(255,255,255,.10)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,.25)",borderRadius:16,padding:20,color:"#fff"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <button onClick={()=>navigate(-1)} style={{padding:"8px 12px",borderRadius:10,border:"1px solid rgba(255,255,255,.3)",background:"transparent",color:"#fff",cursor:"pointer"}}>← Volver</button>
                    <h3 style={{margin:0}}>Herramientas de administración</h3>
                    <div />
                </div>

                <p>Este botón actualizará el campo <code>miembros</code> de todos los documentos en <code>multilinks</code> usando <code>admin_uid</code> y <code>uid</code>.</p>

                <button
                    onClick={runMigration}
                    disabled={running}
                    style={{padding:"12px 16px",borderRadius:12,border:0,background:"#111827",color:"#fff",cursor:"pointer",fontWeight:700}}
                >
                    {running ? "Actualizando…" : "Ejecutar migración"}
                </button>

                <div style={{marginTop:12,fontSize:14,opacity:.95}}>
                    Progreso: {progress.done} / {progress.total}
                    <div style={{height:8,background:"rgba(255,255,255,.2)",borderRadius:999,marginTop:6}}>
                        <div
                            style={{
                                height:"100%",
                                width: progress.total ? `${(progress.done/progress.total)*100}%` : "0%",
                                background:"#22c55e",
                                borderRadius:999,
                                transition:"width .2s ease"
                            }}
                        />
                    </div>
                </div>

                <pre style={{marginTop:12,whiteSpace:"pre-wrap",background:"rgba(0,0,0,.25)",padding:12,borderRadius:12,maxHeight:220,overflow:"auto"}}>
{log.join("\n")}
        </pre>

                <div style={{marginTop:8,fontSize:12,opacity:.9}}>
                    Consejo: elimina esta página cuando termines la migración.
                </div>
            </div>
        </div>
    );
}
