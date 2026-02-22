import { db } from './config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, getDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const MOVIES_COL = 'movies';

// جلب كل الأفلام
export const getMovies = async () => {
    const q = query(collection(db, MOVIES_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// جلب فيلم واحد
export const getMovie = async (id) => {
    const docRef = doc(db, MOVIES_COL, id);
    const snap = await getDoc(docRef);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// إضافة فيلم
export const addMovie = async (movieData) => {
    const docRef = await addDoc(collection(db, MOVIES_COL), {
        ...movieData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

// تعديل فيلم
export const updateMovie = async (id, movieData) => {
    const docRef = doc(db, MOVIES_COL, id);
    await updateDoc(docRef, { ...movieData, updatedAt: serverTimestamp() });
};

// حذف فيلم
export const deleteMovie = async (id) => {
    await deleteDoc(doc(db, MOVIES_COL, id));
};

// إضافة جزء للفيلم
export const addPart = async (movieId, partData) => {
    const movieRef = doc(db, MOVIES_COL, movieId);
    const snap = await getDoc(movieRef);
    if (!snap.exists()) return;
    const parts = snap.data().parts || [];
    const newPart = {
        id: `part_${Date.now()}`,
        ...partData,
    };
    parts.push(newPart);
    await updateDoc(movieRef, { parts, updatedAt: serverTimestamp() });
    return newPart.id;
};

// تعديل جزء
export const updatePart = async (movieId, partId, partData) => {
    const movieRef = doc(db, MOVIES_COL, movieId);
    const snap = await getDoc(movieRef);
    if (!snap.exists()) return;
    const parts = snap.data().parts.map(p =>
        p.id === partId ? { ...p, ...partData } : p
    );
    await updateDoc(movieRef, { parts, updatedAt: serverTimestamp() });
};

// حذف جزء
export const deletePart = async (movieId, partId) => {
    const movieRef = doc(db, MOVIES_COL, movieId);
    const snap = await getDoc(movieRef);
    if (!snap.exists()) return;
    const parts = snap.data().parts.filter(p => p.id !== partId);
    await updateDoc(movieRef, { parts, updatedAt: serverTimestamp() });
};
