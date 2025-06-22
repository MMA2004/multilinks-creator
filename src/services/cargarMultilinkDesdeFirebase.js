import { doc, getDoc } from 'firebase/firestore';
import {db} from "./firebase.js";

export const cargarMultilinkDesdeFirebase = async (id) => {
    try {
        const docRef = doc(db, 'multilinks', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            throw new Error('Multilink no encontrado');
        }
    } catch (error) {
        console.error('Error cargando multilink:', error);
        throw error;
    }
};