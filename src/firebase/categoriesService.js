import { db } from './config';
import {
    collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
    getDocs, getDoc, query, orderBy, serverTimestamp, where
} from 'firebase/firestore';

const CATEGORIES_COL = 'categories';

// جلب كل التصنيفات
export const getCategories = async () => {
    const q = query(collection(db, CATEGORIES_COL), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// إضافة تصنيف رئيسي مع إمكانية تحديد المعرف (ID/Slug) مخصص
export const addCategory = async (data) => {
    let docRef;
    if (data.id && data.id.trim() !== '') {
        // استخدام المعرف المخصص
        const cleanId = data.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        docRef = doc(db, CATEGORIES_COL, cleanId);
        await setDoc(docRef, {
            ...data,
            subcategories: data.subcategories || [],
            createdAt: serverTimestamp(),
        });
        return cleanId;
    } else {
        // توليد معرف عشوائي تلقائي عبر Firebase
        docRef = await addDoc(collection(db, CATEGORIES_COL), {
            ...data,
            subcategories: data.subcategories || [],
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    }
};

// تعديل تصنيف
export const updateCategory = async (id, data) => {
    await updateDoc(doc(db, CATEGORIES_COL, id), { ...data, updatedAt: serverTimestamp() });
};

// تغيير المعرف (الرابط) الخاص بتصنيف وتحديث جميع الأفلام والمسلسلات المرتبطة به
export const changeCategoryId = async (oldId, newId) => {
    const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (cleanId === oldId) return cleanId;

    // 1. جلب بيانات التصنيف القديم
    const oldCatRef = doc(db, CATEGORIES_COL, oldId);
    const snap = await getDoc(oldCatRef);
    if (!snap.exists()) throw new Error('التصنيف غير موجود');

    // 2. التحقق من أن المعرف الجديد ليس مستخدماً بالفعل
    const newCatRef = doc(db, CATEGORIES_COL, cleanId);
    if ((await getDoc(newCatRef)).exists()) throw new Error('هذا الرابط مستخدم بالفعل لتصنيف آخر');

    const catData = snap.data();

    // 3. إنشاء التصنيف بالمعرف الجديد
    await setDoc(newCatRef, { ...catData, updatedAt: serverTimestamp() });

    // 4. تحديث الأفلام المرتبطة بهذا التصنيف
    const moviesQ = query(collection(db, 'movies'), where('category', '==', oldId));
    const moviesSnap = await getDocs(moviesQ);
    for (const mDoc of moviesSnap.docs) {
        await updateDoc(mDoc.ref, { category: cleanId });
    }

    // 5. تحديث المسلسلات المرتبطة بهذا التصنيف
    const seriesQ = query(collection(db, 'series'), where('category', '==', oldId));
    const seriesSnap = await getDocs(seriesQ);
    for (const sDoc of seriesSnap.docs) {
        await updateDoc(sDoc.ref, { category: cleanId });
    }

    // 6. تحديث المحتوى المميز (Featured) المرتبط بهذا التصنيف
    const featuredQ = query(collection(db, 'featured'), where('categoryId', '==', oldId));
    const featuredSnap = await getDocs(featuredQ);
    for (const fDoc of featuredSnap.docs) {
        const featData = fDoc.data();
        // معرّف العنصر المميز يحتوي على categoryId، فيجب إنشاء مستند جديد وحذف القديم
        const newFeatId = `${featData.type}_${featData.contentId}_${cleanId}`;
        await setDoc(doc(db, 'featured', newFeatId), { ...featData, categoryId: cleanId });
        await deleteDoc(fDoc.ref);
    }

    // 7. حذف التصنيف القديم
    await deleteDoc(oldCatRef);

    return cleanId;
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
    const q = query(collection(db, CATEGORIES_COL));
    const snapshot = await getDocs(q);

    // منع إعادة إضافة التصنيفات إذا كانت المجموعة تحتوي على بيانات بالفعل
    // هذا يتيح للمستخدم إمكانية تعديل أسماء التصنيفات الافتراضية أو حذفها دون أن تعود.
    if (!snapshot.empty) return;

    const defaults = [
        { label: 'أفلام عربية', labelEn: 'Arabic Movies', icon: 'movies', order: 1, subcategories: [] },
        { label: 'أفلام أجنبية', labelEn: 'Foreign Movies', icon: 'movies', order: 2, subcategories: [] },
        { label: 'أفلام تركية', labelEn: 'Turkish Movies', icon: 'movies', order: 3, subcategories: [] },
        { label: 'أفلام هندية', labelEn: 'Indian Movies', icon: 'movies', order: 4, subcategories: [] },
        { label: 'أفلام أنميشن', labelEn: 'Animation Movies', icon: 'movies', order: 5, subcategories: [] },
        { label: 'أفلام قصيرة', labelEn: 'Short Movies', icon: 'movies', order: 6, subcategories: [] },
        { label: 'أفلام وثائقية', labelEn: 'Documentaries', icon: 'movies', order: 7, subcategories: [] },
        {
            label: 'المسلسلات', labelEn: 'Series', icon: 'series', order: 8,
            subcategories: [
                { id: 'sub_7', name: 'مسلسلات عربية' }, { id: 'sub_8', name: 'مسلسلات أجنبية' },
                { id: 'sub_9', name: 'مسلسلات تركية' }, { id: 'sub_10', name: 'أنمي' },
                { id: 'sub_11', name: 'وثائقي' },
            ]
        },
        {
            label: 'رمضان', labelEn: 'Ramadan', icon: 'ramadan', order: 9,
            subcategories: [
                { id: 'sub_12', name: 'مسلسلات رمضان 2025' }, { id: 'sub_13', name: 'برامج رمضانية' },
                { id: 'sub_14', name: 'أفلام رمضانية' }, { id: 'sub_15', name: 'فوازير' },
            ]
        },
        {
            label: 'أخرى', labelEn: 'Others', icon: 'other', order: 10,
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
