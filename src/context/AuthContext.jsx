// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setUsuario(user);
            setCargando(false);
        });

        return () => unsub();
    }, []);

    return (
        <AuthContext.Provider value={{ usuario }}>
            {!cargando && children}
        </AuthContext.Provider>
    );
};
