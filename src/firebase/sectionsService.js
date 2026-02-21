import { db } from './config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, getDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const SECTIONS_COL = 'sections';

// جلب كل الأقسام
export const getSections = async () => {
    const q = query(collection(db, SECTIONS_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// إضافة قسم
export const addSection = async (data) => {
    const docRef = await addDoc(collection(db, SECTIONS_COL), {
        ...data,
        items: data.items || [],
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// تعديل قسم
export const updateSection = async (id, data) => {
    await updateDoc(doc(db, SECTIONS_COL, id), { ...data, updatedAt: serverTimestamp() });
};

// حذف قسم
export const deleteSection = async (id) => {
    await deleteDoc(doc(db, SECTIONS_COL, id));
};

// إضافة عنصر لقسم
export const addItemToSection = async (sectionId, item) => {
    const ref = doc(db, SECTIONS_COL, sectionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const items = snap.data().items || [];
    items.push(item);
    await updateDoc(ref, { items, updatedAt: serverTimestamp() });
};

// حذف عنصر من قسم
export const removeItemFromSection = async (sectionId, itemId) => {
    const ref = doc(db, SECTIONS_COL, sectionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const items = snap.data().items.filter(i => i.id !== itemId);
    await updateDoc(ref, { items, updatedAt: serverTimestamp() });
};

// تهيئة الأقسام الافتراضية
export const initDefaultSections = async () => {
    const snapshot = await getDocs(collection(db, SECTIONS_COL));
    if (!snapshot.empty) return;

    const defaults = [
        { title: 'مضاف حديثاً', titleEn: 'Recently Added', type: 'mixed', order: 1, items: [] },
        { title: 'الأكثر رواجاً', titleEn: 'Trending', type: 'mixed', order: 2, items: [] },
        { title: 'المسلسلات الشائعة', titleEn: 'Popular Series', type: 'series', order: 3, items: [] },
        { title: 'أفلام الأكشن', titleEn: 'Action Movies', type: 'movies', order: 4, items: [] },
    ];

    for (const s of defaults) {
        await addDoc(collection(db, SECTIONS_COL), { ...s, createdAt: serverTimestamp() });
    }
};
