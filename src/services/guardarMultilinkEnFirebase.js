import { doc, setDoc } from 'firebase/firestore';
import {db} from "./firebase.js";

export const guardarMultilinkEnFirebase = async (id, datos) => {
    try {
        await setDoc(doc(db, 'multilinks', id), datos);
        console.log('✅ Datos guardados en Firebase');
    } catch (error) {
        console.error('❌ Error guardando en Firebase:', error);
        throw error;
    }
};