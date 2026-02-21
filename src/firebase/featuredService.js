import { db } from './config';
import {
    collection, doc, getDocs, setDoc, deleteDoc,
    query, orderBy, serverTimestamp
} from 'firebase/firestore';

const FEATURED_COL = 'featured';

// إزالة القيم undefined قبل الحفظ في Firebase
const cleanData = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));

// جلب المحتوى المميز (الكافر)
export const getFeatured = async () => {
    const q = query(collection(db, FEATURED_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// إضافة/تحديث عنصر مميز
export const addFeatured = async (item) => {
    const id = `${item.type}_${item.contentId}`;
    await setDoc(doc(db, FEATURED_COL, id), {
        ...cleanData(item),
        updatedAt: serverTimestamp(),
    });
    return id;
};

// حذف عنصر مميز
export const removeFeatured = async (id) => {
    await deleteDoc(doc(db, FEATURED_COL, id));
};

// إعادة ترتيب العناصر المميزة
export const reorderFeatured = async (items) => {
    for (let i = 0; i < items.length; i++) {
        await setDoc(doc(db, FEATURED_COL, items[i].id), {
            ...cleanData(items[i]),
            order: i + 1,
            updatedAt: serverTimestamp(),
        });
    }
};
