import { db } from './config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const FOLDERS_COL = 'movieFolders';

// جلب كل المجلدات
export const getMovieFolders = async () => {
    const q = query(collection(db, FOLDERS_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// إضافة مجلد
export const addMovieFolder = async (data) => {
    const docRef = await addDoc(collection(db, FOLDERS_COL), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// تعديل مجلد
export const updateMovieFolder = async (id, data) => {
    await updateDoc(doc(db, FOLDERS_COL, id), { ...data, updatedAt: serverTimestamp() });
};

// حذف مجلد
export const deleteMovieFolder = async (id) => {
    await deleteDoc(doc(db, FOLDERS_COL, id));
};
