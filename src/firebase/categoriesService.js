import { db } from './config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc,
    getDocs, getDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const CATEGORIES_COL = 'categories';

// جلب كل التصنيفات
export const getCategories = async () => {
    const q = query(collection(db, CATEGORIES_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// إضافة تصنيف رئيسي
export const addCategory = async (data) => {
    const docRef = await addDoc(collection(db, CATEGORIES_COL), {
        ...data,
        subcategories: data.subcategories || [],
        createdAt: serverTimestamp(),
    });
    return docRef.id;
};

// تعديل تصنيف
export const updateCategory = async (id, data) => {
    await updateDoc(doc(db, CATEGORIES_COL, id), { ...data, updatedAt: serverTimestamp() });
};

// حذف تصنيف
export const deleteCategory = async (id) => {
    await deleteDoc(doc(db, CATEGORIES_COL, id));
};

// إضافة تصنيف فرعي
export const addSubcategory = async (categoryId, subName) => {
    const catRef = doc(db, CATEGORIES_COL, categoryId);
    const snap = await getDoc(catRef);
    if (!snap.exists()) return;
    const subs = snap.data().subcategories || [];
    subs.push({ id: `sub_${Date.now()}`, name: subName });
    await updateDoc(catRef, { subcategories: subs, updatedAt: serverTimestamp() });
};

// تعديل تصنيف فرعي
export const updateSubcategory = async (categoryId, subId, newName) => {
    const catRef = doc(db, CATEGORIES_COL, categoryId);
    const snap = await getDoc(catRef);
    if (!snap.exists()) return;
    const subs = snap.data().subcategories.map(s => s.id === subId ? { ...s, name: newName } : s);
    await updateDoc(catRef, { subcategories: subs, updatedAt: serverTimestamp() });
};

// حذف تصنيف فرعي
export const deleteSubcategory = async (categoryId, subId) => {
    const catRef = doc(db, CATEGORIES_COL, categoryId);
    const snap = await getDoc(catRef);
    if (!snap.exists()) return;
    const subs = snap.data().subcategories.filter(s => s.id !== subId);
    await updateDoc(catRef, { subcategories: subs, updatedAt: serverTimestamp() });
};

// تهيئة التصنيفات الافتراضية إذا كانت فارغة
export const initDefaultCategories = async () => {
    const snapshot = await getDocs(collection(db, CATEGORIES_COL));
    if (!snapshot.empty) return;

    const defaults = [
        {
            label: 'الأفلام', labelEn: 'Movies', icon: 'movies', order: 1,
            subcategories: [
                { id: 'sub_1', name: 'أكشن' }, { id: 'sub_2', name: 'كوميديا' },
                { id: 'sub_3', name: 'دراما' }, { id: 'sub_4', name: 'رعب' },
                { id: 'sub_5', name: 'خيال علمي' }, { id: 'sub_6', name: 'رومانسي' },
            ]
        },
        {
            label: 'المسلسلات', labelEn: 'Series', icon: 'series', order: 2,
            subcategories: [
                { id: 'sub_7', name: 'مسلسلات عربية' }, { id: 'sub_8', name: 'مسلسلات أجنبية' },
                { id: 'sub_9', name: 'مسلسلات تركية' }, { id: 'sub_10', name: 'أنمي' },
                { id: 'sub_11', name: 'وثائقي' },
            ]
        },
        {
            label: 'رمضان', labelEn: 'Ramadan', icon: 'ramadan', order: 3,
            subcategories: [
                { id: 'sub_12', name: 'مسلسلات رمضان 2025' }, { id: 'sub_13', name: 'برامج رمضانية' },
                { id: 'sub_14', name: 'أفلام رمضانية' }, { id: 'sub_15', name: 'فوازير' },
            ]
        },
        {
            label: 'أخرى', labelEn: 'Others', icon: 'other', order: 4,
            subcategories: [
                { id: 'sub_16', name: 'برامج' }, { id: 'sub_17', name: 'رياضة' },
                { id: 'sub_18', name: 'أطفال' }, { id: 'sub_19', name: 'موسيقى' },
            ]
        },
    ];

    for (const cat of defaults) {
        await addDoc(collection(db, CATEGORIES_COL), { ...cat, createdAt: serverTimestamp() });
    }
};
