import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import logoWebm from '../assets/logo.webm';
import logo from '../assets/Logo.png';

// 30 avatar color combos
const AVATAR_COLORS = [
    { bg: 'from-yellow-400 to-orange-500', text: 'text-black' },
    { bg: 'from-blue-500 to-indigo-600', text: 'text-white' },
    { bg: 'from-pink-500 to-rose-600', text: 'text-white' },
    { bg: 'from-emerald-400 to-teal-600', text: 'text-white' },
    { bg: 'from-purple-500 to-violet-700', text: 'text-white' },
    { bg: 'from-cyan-400 to-sky-600', text: 'text-white' },
    { bg: 'from-red-500 to-rose-700', text: 'text-white' },
    { bg: 'from-amber-400 to-yellow-600', text: 'text-black' },
];

const AVATAR_EMOJIS = ['🎬', '🎭', '🎥', '🌟', '🦁', '🐉', '🦋', '🌙', '⚡', '🔥', '❄️', '🌊', '🎮', '🎸', '🏆', '🦊'];

export default function ProfilesManagement() {
    const { user, profiles, selectProfile, fetchProfiles } = useAuth();
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const handleSelect = (profile) => {
        selectProfile(profile);
        navigate('/');
    };

    const handleDelete = async (profileId) => {
        setLoading(true);
        try {
            const updated = profiles.filter(p => p.id !== profileId);
            await updateDoc(doc(db, 'users', user.uid), { profiles: updated });
            await fetchProfiles(user.uid);
        } catch (err) {
            console.error(err);
        }
        setShowDeleteConfirm(null);
        setLoading(false);
    };

    const colorForProfile = (p, index) => AVATAR_COLORS[index % AVATAR_COLORS.length];

    return (
        <div className="min-h-screen bg-[#050514] flex flex-col items-center justify-center p-6 font-arabic relative overflow-hidden" dir="rtl">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.06)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(59,130,246,0.06)_0%,transparent_50%)]" />

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16"
            >
                <video autoPlay loop muted playsInline className="h-16 w-auto object-contain">
                    <source src={logoWebm} type="video/webm" />
                    <img src={logo} alt="TagFilm" className="h-16 w-auto" />
                </video>
            </motion.div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-14"
            >
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                    {editMode ? 'إدارة الملفات' : 'من يشاهد الآن؟'}
                </h1>
                {!editMode && (
                    <p className="text-gray-500 mt-3 text-base">اختر ملفك الشخصي لبدء المشاهدة</p>
                )}
            </motion.div>

            {/* Profiles Grid */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 max-w-4xl">
                <AnimatePresence>
                    {profiles.map((p, index) => {
                        const color = colorForProfile(p, index);
                        const emoji = AVATAR_EMOJIS[index % AVATAR_EMOJIS.length];
                        return (
                            <motion.div
                                key={p.id}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ delay: index * 0.08 }}
                                className="flex flex-col items-center gap-4 cursor-pointer relative"
                                onClick={() => !editMode && handleSelect(p)}
                            >
                                {/* Avatar */}
                                <motion.div
                                    whileHover={!editMode ? { scale: 1.1, y: -4 } : {}}
                                    whileTap={!editMode ? { scale: 0.95 } : {}}
                                    className={`relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-2xl border-4 transition-all duration-300 ${!editMode ? 'border-transparent hover:border-white cursor-pointer' : 'border-transparent cursor-default'}`}
                                >
                                    {p.avatarEmoji ? (
                                        <span className="text-5xl md:text-6xl">{p.avatarEmoji}</span>
                                    ) : (
                                        <span className={`text-5xl md:text-6xl font-black ${color.text}`}>
                                            {p.name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}

                                    {/* Kids badge */}
                                    {p.isKids && (
                                        <div className="absolute -bottom-2 -left-2 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                                            أطفال
                                        </div>
                                    )}

                                    {/* Edit overlay */}
                                    {editMode && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center gap-3"
                                        >
                                            <Link
                                                to="/profile"
                                                onClick={() => selectProfile(p)}
                                                className="flex items-center gap-2 bg-white/90 text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-white transition-colors"
                                            >
                                                ✏️ تعديل
                                            </Link>
                                            <button
                                                onClick={() => setShowDeleteConfirm(p.id)}
                                                className="flex items-center gap-2 bg-red-500/90 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-red-500 transition-colors"
                                                disabled={profiles.length <= 1}
                                            >
                                                🗑️ حذف
                                            </button>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Name */}
                                <span className={`font-bold text-lg transition-colors ${!editMode ? 'text-gray-400 hover:text-white' : 'text-gray-400'}`}>
                                    {p.name}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Add Profile Card */}
                {profiles.length < 5 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: profiles.length * 0.08 }}
                    >
                        <Link
                            to="/profile-setup"
                            className="flex flex-col items-center gap-4 group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-white/[0.04] border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 group-hover:bg-white/[0.08] group-hover:border-yellow-400/60 transition-all shadow-xl"
                            >
                                <span className="text-4xl text-gray-500 group-hover:text-yellow-400 transition-colors font-black">+</span>
                                <span className="text-gray-600 group-hover:text-yellow-400 text-xs font-bold transition-colors">ملف جديد</span>
                            </motion.div>
                            <span className="text-gray-500 group-hover:text-white font-bold text-lg transition-colors">إضافة ملف</span>
                        </Link>
                    </motion.div>
                )}
            </div>

            {/* Bottom actions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-4 mt-20"
            >
                <button
                    onClick={() => setEditMode(!editMode)}
                    className={`px-8 py-2.5 border font-bold tracking-wider text-sm uppercase rounded-lg transition-all ${editMode ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-white/30 text-white/60 hover:border-white hover:text-white'}`}
                >
                    {editMode ? '✓ انتهيت' : 'إدارة الملفات'}
                </button>
            </motion.div>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0d0d25] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center space-y-6"
                        >
                            <div className="text-5xl">🗑️</div>
                            <h3 className="text-xl font-black text-white font-arabic">حذف الملف الشخصي؟</h3>
                            <p className="text-gray-400 font-arabic text-sm">لن تتمكن من استعادة هذا الملف أو بياناته بعد الحذف.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold font-arabic hover:bg-white/10 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-red-500 rounded-2xl text-white font-black font-arabic hover:bg-red-400 transition-colors disabled:opacity-50"
                                >
                                    {loading ? '...' : 'حذف'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
