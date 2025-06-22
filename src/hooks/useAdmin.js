import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";

export const useAdmin = () => {
    const [user] = useAuthState(auth);
    const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
        .split(",")
        .map(email => email.trim().toLowerCase());
    return user && adminEmails.includes(user.email);
};