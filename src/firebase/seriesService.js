import { db } from './config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, getDoc, query, orderBy, serverTimestamp,
    setDoc
} from 'firebase/firestore';

const SERIES_COL = 'series';

// جلب كل المسلسلات
export const getSeries = async () => {
    const q = query(collection(db, SERIES_COL), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// جلب مسلسل واحد
export const getSeriesById = async (id) => {
    const snap = await getDoc(doc(db, SERIES_COL, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// إضافة مسلسل
export const addSeries = async (seriesData) => {
    const docRef = await addDoc(collection(db, SERIES_COL), {
        ...seriesData,
        seasons: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return docRef.id;
};

// تعديل مسلسل
export const updateSeries = async (id, seriesData) => {
    await updateDoc(doc(db, SERIES_COL, id), { ...seriesData, updatedAt: serverTimestamp() });
};

// حذف مسلسل
export const deleteSeries = async (id) => {
    await deleteDoc(doc(db, SERIES_COL, id));
};

// إضافة موسم
export const addSeason = async (seriesId, seasonData) => {
    const seriesRef = doc(db, SERIES_COL, seriesId);
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) return;
    const seasons = snap.data().seasons || [];
    const newSeason = {
        id: `season_${Date.now()}`,
        episodes: [],
        ...seasonData,
    };
    seasons.push(newSeason);
    await updateDoc(seriesRef, { seasons, updatedAt: serverTimestamp() });
    return newSeason.id;
};

// تعديل موسم
export const updateSeason = async (seriesId, seasonId, seasonData) => {
    const seriesRef = doc(db, SERIES_COL, seriesId);
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) return;
    const seasons = snap.data().seasons.map(s =>
        s.id === seasonId ? { ...s, ...seasonData } : s
    );
    await updateDoc(seriesRef, { seasons, updatedAt: serverTimestamp() });
};

// حذف موسم
export const deleteSeason = async (seriesId, seasonId) => {
    const seriesRef = doc(db, SERIES_COL, seriesId);
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) return;
    const seasons = snap.data().seasons.filter(s => s.id !== seasonId);
    await updateDoc(seriesRef, { seasons, updatedAt: serverTimestamp() });
};

// إضافة حلقة
export const addEpisode = async (seriesId, seasonId, episodeData) => {
    const seriesRef = doc(db, SERIES_COL, seriesId);
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) return;
    const seasons = snap.data().seasons.map(s => {
        if (s.id !== seasonId) return s;
        const episodes = s.episodes || [];
        episodes.push({ id: `ep_${Date.now()}`, ...episodeData });
        return { ...s, episodes };
    });
    await updateDoc(seriesRef, { seasons, updatedAt: serverTimestamp() });
};

// تعديل حلقة
export const updateEpisode = async (seriesId, seasonId, episodeId, episodeData) => {
    const seriesRef = doc(db, SERIES_COL, seriesId);
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) return;
    const seasons = snap.data().seasons.map(s => {
        if (s.id !== seasonId) return s;
        const episodes = s.episodes.map(e => e.id === episodeId ? { ...e, ...episodeData } : e);
        return { ...s, episodes };
    });
    await updateDoc(seriesRef, { seasons, updatedAt: serverTimestamp() });
};

// حذف حلقة
export const deleteEpisode = async (seriesId, seasonId, episodeId) => {
    const seriesRef = doc(db, SERIES_COL, seriesId);
    const snap = await getDoc(seriesRef);
    if (!snap.exists()) return;
    const seasons = snap.data().seasons.map(s => {
        if (s.id !== seasonId) return s;
        const episodes = s.episodes.filter(e => e.id !== episodeId);
        return { ...s, episodes };
    });
    await updateDoc(seriesRef, { seasons, updatedAt: serverTimestamp() });
};
