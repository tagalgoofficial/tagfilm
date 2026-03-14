import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

// دالة تنظيف الكائنات من الـ undefined لمنع أخطاء Firebase
const removeUndefined = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        return value === undefined ? null : value;
    }));
};


export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [activeProfile, setActiveProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Auth ────────────────────────────────────────────────────────────
    const signup = (email, password) =>
        createUserWithEmailAndPassword(auth, email, password);

    const login = (email, password) =>
        signInWithEmailAndPassword(auth, email, password);

    const logout = () => {
        localStorage.removeItem('tagfilm_active_profile_id');
        setActiveProfile(null);
        setProfiles([]);
        return signOut(auth);
    };

    // ─── Profiles ────────────────────────────────────────────────────────

    /** جلب الملفات الشخصية من Firestore وتحديث الـ state */
    const fetchProfiles = useCallback(async (uid) => {
        if (!uid) return;
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userProfiles = docSnap.data().profiles || [];
                setProfiles(userProfiles);

                const savedId = localStorage.getItem('tagfilm_active_profile_id');
                if (savedId) {
                    const found = userProfiles.find(p => p.id === savedId);
                    setActiveProfile(found || null);
                } else if (userProfiles.length === 1) {
                    setActiveProfile(userProfiles[0]);
                    localStorage.setItem('tagfilm_active_profile_id', userProfiles[0].id);
                }
            } else {
                // أنشئ مستند المستخدم لو لم يكن موجوداً
                await setDoc(doc(db, 'users', uid), { profiles: [], createdAt: serverTimestamp() });
                setProfiles([]);
                setActiveProfile(null);
            }
        } catch (error) {
            console.error('fetchProfiles error:', error);
        }
    }, []);

    /** اختيار ملف شخصي (تخزّن في localStorage) */
    const selectProfile = useCallback((profile) => {
        setActiveProfile(profile);
        if (profile?.id) {
            localStorage.setItem('tagfilm_active_profile_id', profile.id);
        } else {
            localStorage.removeItem('tagfilm_active_profile_id');
        }
    }, []);

    /** إضافة ملف شخصي جديد */
    const addProfile = useCallback(async (uid, newProfile) => {
        const cleanProfile = removeUndefined(newProfile);
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        const existing = docSnap.exists() ? (docSnap.data().profiles || []) : [];
        if (existing.length >= 5) throw new Error('الحد الأقصى 5 ملفات شخصية');
        const updated = [...existing, cleanProfile];
        await setDoc(docRef, { profiles: updated, updatedAt: serverTimestamp() }, { merge: true });
        setProfiles(updated);
        return updated;
    }, []);

    /** تعديل ملف شخصي موجود */
    const updateProfileData = useCallback(async (uid, updatedProfile) => {
        const cleanProfile = removeUndefined(updatedProfile);
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('المستخدم غير موجود. الرجاء تسجيل الدخول مجدداً.');
        const existing = docSnap.data().profiles || [];
        const updated = existing.map(p => p.id === cleanProfile.id ? { ...p, ...cleanProfile } : p);
        await updateDoc(docRef, { profiles: updated, updatedAt: serverTimestamp() });
        setProfiles(updated);
        // تحديث الـ activeProfile
        setActiveProfile(prev => prev?.id === cleanProfile.id ? { ...prev, ...cleanProfile } : prev);
        return updated;
    }, []);

    /** حذف ملف شخصي */
    const deleteProfile = useCallback(async (uid, profileId) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return;
        const updated = (docSnap.data().profiles || []).filter(p => p.id !== profileId);
        await updateDoc(docRef, { profiles: updated, updatedAt: serverTimestamp() });
        setProfiles(updated);
        // لو حذف الـ active profile → reset
        setActiveProfile(prev => {
            if (prev?.id === profileId) {
                localStorage.removeItem('tagfilm_active_profile_id');
                return null;
            }
            return prev;
        });
        return updated;
    }, []);

    // ─── Auth listener ───────────────────────────────────────────────────
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchProfiles(currentUser.uid);
            } else {
                setProfiles([]);
                setActiveProfile(null);
                localStorage.removeItem('tagfilm_active_profile_id');
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [fetchProfiles]);

    const value = {
        user,
        profiles,
        activeProfile,
        loading,
        selectProfile,
        fetchProfiles,
        addProfile,
        updateProfileData,
        deleteProfile,
        signup,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
