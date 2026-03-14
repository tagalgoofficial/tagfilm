import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategories } from '../firebase/categoriesService';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';
import { db } from '../firebase/config';
import Header from '../components/Header';
import { FiCheck, FiUser, FiHeart, FiFilm, FiSave } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';

const AVATAR_EMOJIS = ['🎬', '🎭', '🎥', '🌟', '🦁', '🐉', '🦋', '🌙', '⚡', '🔥', '❄️', '🌊', '🎮', '🎸', '🏆', '🦊', '🐺', '🌺', '🚀', '🎯', '👑', '💎', '🌈', '🦚', '🐬', '🦅', '🌸', '🍀', '⚽', '🎻'];

const AVATAR_COLORS = [
    'from-yellow-400 to-orange-500',
    'from-blue-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-emerald-400 to-teal-600',
    'from-purple-500 to-violet-700',
    'from-cyan-400 to-sky-600',
    'from-red-500 to-rose-700',
    'from-amber-400 to-yellow-600',
    'from-fuchsia-500 to-pink-700',
    'from-lime-400 to-green-600',
];

const TABS = [
    { id: 'basic', label: 'الأساسيات', icon: FiUser },
    { id: 'interests', label: 'الاهتمامات', icon: FiHeart },
    { id: 'media', label: 'أعمالي المفضلة', icon: FiFilm },
];

export default function Profile() {
    const { user, activeProfile, profiles, updateProfileData } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    // Form State
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const [ageGroup, setAgeGroup] = useState('');
    const [hasKids, setHasKids] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [avatarEmoji, setAvatarEmoji] = useState('');
    const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [isKids, setIsKids] = useState(false);

    // Data
    const [categories, setCategories] = useState([]);
    const [availableMedia, setAvailableMedia] = useState([]);
    const [mediaSearch, setMediaSearch] = useState('');

    // Current profile index for color
    const profileIndex = profiles.findIndex(p => p.id === activeProfile?.id);
    const displayColor = avatarColor || AVATAR_COLORS[Math.max(0, profileIndex) % AVATAR_COLORS.length];

    useEffect(() => {
        if (activeProfile) {
            setName(activeProfile.name || '');
            setGender(activeProfile.gender || '');
            setAgeGroup(activeProfile.ageGroup || '');
            setHasKids(activeProfile.hasKids || '');
            setPhone(activeProfile.phone || '');
            setSelectedCategories(activeProfile.categories || []);
            setSelectedMedia(activeProfile.media || []);
            setAvatarEmoji(activeProfile.avatarEmoji || '');
            setAvatarColor(activeProfile.avatarColor || AVATAR_COLORS[Math.max(0, profileIndex) % AVATAR_COLORS.length]);
            setIsKids(activeProfile.isKids || false);
        }
    }, [activeProfile]);

    useEffect(() => {
        const fetchData = async () => {
            const [cats, movies, series] = await Promise.all([
                getCategories(),
                getMovies(),
                getSeries()
            ]);
            setCategories(cats);
            setAvailableMedia([...movies, ...series].slice(0, 40));
        };
        fetchData();
    }, []);

    const handleUpdate = async () => {
        if (!activeProfile) return;
        setLoading(true);
        try {
            const updatedProfile = {
                ...activeProfile,
                name, gender, ageGroup, hasKids, phone,
                categories: selectedCategories,
                media: selectedMedia,
                avatarEmoji, avatarColor, isKids,
                updatedAt: Date.now()
            };
            await updateProfileData(user.uid, updatedProfile);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message);
        }
        setLoading(false);
    };

    const toggleCategory = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(c => c !== id));
        } else if (selectedCategories.length < 8) {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    const toggleMedia = (id) => {
        if (selectedMedia.includes(id)) {
            setSelectedMedia(selectedMedia.filter(m => m !== id));
        } else if (selectedMedia.length < 10) {
            setSelectedMedia([...selectedMedia, id]);
        }
    };

    const filteredMedia = availableMedia.filter(m =>
        !mediaSearch || (m.titleAr || m.title || '').toLowerCase().includes(mediaSearch.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050514] text-white font-arabic pb-24" dir="rtl">
            <Header />

            <div className="container mx-auto px-4 lg:px-8 pt-28 lg:pt-36 max-w-6xl">

                {/* ===== Profile Hero ===== */}
                <div className="relative mb-10 rounded-3xl overflow-hidden border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent p-8 md:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,215,0,0.07)_0%,transparent_60%)]" />

                    <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAvatarPicker(true)}
                                className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-br ${displayColor} flex items-center justify-center shadow-2xl border-2 border-white/10 hover:border-yellow-400/60 transition-all relative group`}
                            >
                                {avatarEmoji ? (
                                    <span className="text-5xl md:text-6xl">{avatarEmoji}</span>
                                ) : (
                                    <span className="text-5xl md:text-6xl font-black">
                                        {name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                )}
                                {/* Edit overlay */}
                                <div className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">✏️ تغيير</span>
                                </div>
                            </motion.button>
                            {isKids && (
                                <div className="absolute -bottom-2 -left-2 bg-yellow-400 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg">
                                    👶 أطفال
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-right">
                            <h1 className="text-3xl md:text-5xl font-black leading-tight text-white mb-2">
                                {name || 'اسمك هنا'}
                            </h1>
                            <p className="text-gray-500 text-sm">{user.email}</p>
                            <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                                {selectedCategories.slice(0, 4).map(id => {
                                    const cat = categories.find(c => c.id === id);
                                    return cat ? (
                                        <span key={id} className="px-3 py-1 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-yellow-400 text-xs font-bold">
                                            {cat.label}
                                        </span>
                                    ) : null;
                                })}
                                {selectedCategories.length > 4 && (
                                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs font-bold">
                                        +{selectedCategories.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Save button */}
                        <motion.button
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={handleUpdate}
                            disabled={loading}
                            className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-base shadow-2xl transition-all ${saved
                                ? 'bg-emerald-400 text-black shadow-emerald-500/30'
                                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-yellow-500/30 hover:shadow-yellow-500/50'
                                } disabled:opacity-60`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                            ) : saved ? (
                                <FiCheck className="text-xl" />
                            ) : (
                                <FiSave className="text-xl" />
                            )}
                            {loading ? 'جاري الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
                        </motion.button>
                    </div>
                </div>

                {/* ===== Tabs ===== */}
                <div className="flex gap-2 mb-8 p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl backdrop-blur-sm">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.id
                                ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="text-base" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ===== Tab Content ===== */}
                <AnimatePresence mode="wait">
                    {/* --- Basic Tab --- */}
                    {activeTab === 'basic' && (
                        <motion.div
                            key="basic"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الاسم المستعار</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="ما اسمك؟"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.06] transition-all text-base font-bold"
                                    />
                                </div>
                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">رقم الهاتف</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        placeholder="05xxxxxxxx"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/50 focus:bg-white/[0.06] transition-all text-base font-bold"
                                        dir="ltr"
                                    />
                                </div>
                                {/* Email (readonly) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full bg-white/[0.02] border border-white/[0.04] rounded-2xl px-5 py-4 text-gray-600 cursor-not-allowed text-base"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الجنس</label>
                                <div className="flex flex-wrap gap-3">
                                    {['ذكر', 'أنثى', 'أفضل عدم القول'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setGender(g)}
                                            className={`px-6 py-2.5 rounded-xl border font-bold text-sm transition-all ${gender === g
                                                ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                                                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Age Group */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">الفئة العمرية</label>
                                <div className="flex flex-wrap gap-3">
                                    {['23 وأصغر', '24–34', '35–44', '45–55', '55 وأكبر'].map(a => (
                                        <button
                                            key={a}
                                            onClick={() => setAgeGroup(a)}
                                            className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${ageGroup === a
                                                ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-500/20'
                                                : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                                }`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Kids mode */}
                            <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                                <div>
                                    <p className="text-white font-black">وضع الأطفال 👶</p>
                                    <p className="text-gray-500 text-sm mt-1">تقييد المحتوى لمحتوى آمن للأطفال فقط</p>
                                </div>
                                <button
                                    onClick={() => setIsKids(!isKids)}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isKids ? 'bg-yellow-400' : 'bg-white/10'}`}
                                >
                                    <motion.div
                                        animate={{ x: isKids ? 28 : 2 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-lg ${isKids ? 'bg-black' : 'bg-white/50'}`}
                                    />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* --- Interests Tab --- */}
                    {activeTab === 'interests' && (
                        <motion.div
                            key="interests"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-black text-white">الفئات المفضلة</h2>
                                    <p className="text-gray-500 text-sm mt-1">اختر ما يشدّك لنقترح عليك ما يناسبك (حد أقصى 8)</p>
                                </div>
                                <span className="px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl text-yellow-400 text-sm font-black">
                                    {selectedCategories.length} / 8
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {categories.map((cat, i) => {
                                    const selected = selectedCategories.includes(cat.id);
                                    const catEmojis = ['🎬', '📺', '🎭', '🌍', '👻', '❤️', '😂', '🔫', '🚀', '🏈', '🎵', '📚', '🦸', '🔮', '🌸', '⚔️'];
                                    return (
                                        <motion.button
                                            key={cat.id}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`relative p-4 rounded-2xl border text-right transition-all overflow-hidden ${selected
                                                ? 'bg-yellow-400/15 border-yellow-400/40 text-white'
                                                : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/20 hover:text-white'
                                                } ${!selected && selectedCategories.length >= 8 ? 'opacity-40 cursor-not-allowed' : ''}`}
                                            disabled={!selected && selectedCategories.length >= 8}
                                        >
                                            <div className="text-2xl mb-2">{catEmojis[i % catEmojis.length]}</div>
                                            <div className="font-bold text-sm">{cat.label}</div>
                                            {selected && (
                                                <div className="absolute top-2 left-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow">
                                                    <FiCheck className="text-black text-xs" />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* --- Media Tab --- */}
                    {activeTab === 'media' && (
                        <motion.div
                            key="media"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-white">أعمالي المفضلة</h2>
                                    <p className="text-gray-500 text-sm mt-1">اختر أهم 10 أعمال تعشقها</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="px-4 py-1.5 bg-yellow-400/10 border border-yellow-400/20 rounded-xl text-yellow-400 text-sm font-black">
                                        {selectedMedia.length} / 10
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="🔍  ابحث..."
                                        value={mediaSearch}
                                        onChange={e => setMediaSearch(e.target.value)}
                                        className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/40 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Selected strip */}
                            {selectedMedia.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {selectedMedia.map(id => {
                                        const item = availableMedia.find(m => m.id === id);
                                        if (!item) return null;
                                        return (
                                            <motion.div
                                                key={id}
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="relative flex-shrink-0 w-16 h-24 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-lg shadow-yellow-500/20"
                                            >
                                                <img src={item.poster} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => toggleMedia(id)}
                                                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xl"
                                                >
                                                    ✕
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                                {filteredMedia.map(item => {
                                    const selected = selectedMedia.includes(item.id);
                                    return (
                                        <motion.button
                                            key={item.id}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => toggleMedia(item.id)}
                                            className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all ${selected
                                                ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#050514] opacity-100'
                                                : 'opacity-60 hover:opacity-100'
                                                } ${!selected && selectedMedia.length >= 10 ? 'cursor-not-allowed' : ''}`}
                                            disabled={!selected && selectedMedia.length >= 10}
                                        >
                                            <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                                            {selected && (
                                                <div className="absolute inset-0 bg-yellow-400/20 flex items-start justify-end p-1.5">
                                                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                                        <FiCheck className="text-black text-xs font-black" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                <p className="text-white text-[10px] font-bold truncate">{item.titleAr || item.title}</p>
                                                {item.rating && (
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <AiFillStar className="text-yellow-400 text-[10px]" />
                                                        <span className="text-yellow-400 text-[9px] font-bold">{item.rating}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ===== Avatar Picker Modal ===== */}
            <AnimatePresence>
                {showAvatarPicker && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-2xl flex items-center justify-center p-6"
                        onClick={() => setShowAvatarPicker(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-[#0d0d28] border border-white/10 rounded-3xl p-8 max-w-lg w-full space-y-8 shadow-2xl"
                        >
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-white font-arabic">اختر أيقونتك</h3>
                                <p className="text-gray-500 text-sm mt-2 font-arabic">شخصيّتك، اختيارك</p>
                            </div>

                            {/* Preview */}
                            <div className="flex justify-center">
                                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${avatarColor} flex items-center justify-center shadow-2xl border border-white/20`}>
                                    {avatarEmoji ? (
                                        <span className="text-5xl">{avatarEmoji}</span>
                                    ) : (
                                        <span className="text-5xl font-black">{name?.charAt(0)?.toUpperCase() || '?'}</span>
                                    )}
                                </div>
                            </div>

                            {/* Emoji Grid */}
                            <div>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 font-arabic">الأيقونة</p>
                                <div className="grid grid-cols-6 gap-2">
                                    {AVATAR_EMOJIS.map(emoji => (
                                        <button
                                            key={emoji}
                                            onClick={() => setAvatarEmoji(emoji === avatarEmoji ? '' : emoji)}
                                            className={`aspect-square rounded-2xl text-2xl flex items-center justify-center transition-all ${avatarEmoji === emoji
                                                ? 'bg-yellow-400/20 border-2 border-yellow-400 scale-110 shadow-lg'
                                                : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/10 hover:scale-105'
                                                }`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Grid */}
                            <div>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 font-arabic">اللون</p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {AVATAR_COLORS.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setAvatarColor(color)}
                                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} transition-all shadow-lg ${avatarColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d0d28] scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowAvatarPicker(false)}
                                className="w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl text-base shadow-xl hover:shadow-yellow-500/30 transition-all"
                            >
                                تأكيد الاختيار ✓
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
