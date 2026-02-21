import { db } from './config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const FOLDERS_COL = 'seriesFolders';

// جلب كل المجلدات
export const getSeriesFolders = async () => {
    const q = query(collection(db, FOLDERS_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// إضافة مجلد
export const addSeriesFolder = async (data) => {
    const docRef = await addDoc(collection(db, FOLDERS_COL), {
        ...data,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// تعديل مجلد
export const updateSeriesFolder = async (id, data) => {
    await updateDoc(doc(db, FOLDERS_COL, id), { ...data, updatedAt: serverTimestamp() });
};

// حذف مجلد
export const deleteSeriesFolder = async (id) => {
    await deleteDoc(doc(db, FOLDERS_COL, id));
};
