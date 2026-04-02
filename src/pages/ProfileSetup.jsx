import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../firebase/categoriesService';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';

import logo from '../assets/logo.png';
import { FiCheck } from 'react-icons/fi';

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

const CAT_EMOJIS = ['🎬', '📺', '🎭', '🌍', '👻', '❤️', '😂', '🔫', '🚀', '🏈', '🎵', '📚', '🦸', '🔮', '🌸', '⚔️'];

const STEPS = ['الملف', 'الاهتمامات', 'الأعمال', 'التفاصيل'];

export default function ProfileSetup() {
    const [step, setStep] = useState(0);
    const { user, addProfile, selectProfile, profiles } = useAuth();
    const navigate = useNavigate();

    const [profileName, setProfileName] = useState('');
    const [avatarEmoji, setAvatarEmoji] = useState('🎬');
    const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
    const [isKids, setIsKids] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedMedia, setSelectedMedia] = useState([]);
    const [details, setDetails] = useState({ gender: '', ageGroup: '', hasKids: '', phone: '' });

    const [categories, setCategories] = useState([]);
    const [availableMedia, setAvailableMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const [cats, movies, series] = await Promise.all([getCategories(), getMovies(), getSeries()]);
            setCategories(cats);
            setAvailableMedia([...movies, ...series].slice(0, 30));
        };
        fetchData();
    }, []);

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const newProfile = {
                id: `profile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                name: profileName.trim(),
                avatarEmoji,
                avatarColor,
                isKids,
                categories: selectedCategories,
                media: selectedMedia,
                gender: details.gender,
                ageGroup: details.ageGroup,
                hasKids: details.hasKids,
                phone: details.phone,
                createdAt: Date.now(),
            };
            await addProfile(user.uid, newProfile);
            selectProfile(newProfile);
            navigate('/profiles');
        } catch (err) {
            setError(err.message || 'حدث خطأ أثناء الحفظ');
        }
        setLoading(false);
    };

    const toggleCat = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id)
                : prev.length < 8 ? [...prev, id] : prev
        );
    };

    const toggleMedia = (id) => {
        setSelectedMedia(prev =>
            prev.includes(id) ? prev.filter(m => m !== id)
                : prev.length < 10 ? [...prev, id] : prev
        );
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#050514] text-white font-arabic overflow-x-hidden" dir="rtl">
            {/* Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,215,0,0.05)_0%,transparent_60%)] pointer-events-none" />

            {/* Header */}
            <header className="relative flex items-center justify-between px-8 py-6">
                <video autoPlay loop muted playsInline className="h-10 w-auto object-contain">
                    <source src={logoWebm} type="video/webm" />
                    <img src={logo} alt="TagFilm" className="h-10" />
                </video>

                {/* Progress Steps */}
                <div className="flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-black transition-all ${i < step ? 'bg-yellow-400 text-black' : i === step ? 'bg-yellow-400/20 border-2 border-yellow-400 text-yellow-400' : 'bg-white/5 border border-white/10 text-gray-600'}`}>
                                {i < step ? <FiCheck /> : i + 1}
                            </div>
                            <span className={`text-xs font-bold hidden sm:inline transition-colors ${i === step ? 'text-yellow-400' : i < step ? 'text-gray-400' : 'text-gray-700'}`}>{s}</span>
                            {i < STEPS.length - 1 && <div className={`w-8 h-px mx-1 ${i < step ? 'bg-yellow-400/50' : 'bg-white/10'}`} />}
                        </div>
                    ))}
                </div>

                <button onClick={() => navigate('/profiles')} className="text-gray-500 hover:text-white text-sm transition-colors">
                    تخطي
                </button>
            </header>

            <main className="relative max-w-3xl mx-auto px-6 pb-20 pt-8">
                <AnimatePresence mode="wait">

                    {/* ── Step 0: اسم + avatar ── */}
                    {step === 0 && (
                        <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-8">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">أنشئ ملفك الشخصي</h1>
                                <p className="text-gray-500">اختر اسماً وأيقونة تعبّر عنك</p>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                {/* Avatar preview */}
                                <div className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-6xl shadow-2xl border-2 border-white/10`}>
                                    {avatarEmoji}
                                </div>

                                {/* Name input */}
                                <input
                                    type="text"
                                    value={profileName}
                                    onChange={e => setProfileName(e.target.value)}
                                    placeholder="اسم الملف الشخصي"
                                    maxLength={20}
                                    className="w-full max-w-sm text-center text-xl bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/50 transition-all font-bold"
                                    autoFocus
                                />
                            </div>

                            {/* Emoji grid */}
                            <div>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">اختر الأيقونة</p>
                                <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
                                    {AVATAR_EMOJIS.map(e => (
                                        <button key={e} onClick={() => setAvatarEmoji(e)}
                                            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${avatarEmoji === e ? 'bg-yellow-400/20 border-2 border-yellow-400 scale-110' : 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/10'}`}>
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color grid */}
                            <div>
                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">لون الخلفية</p>
                                <div className="flex flex-wrap gap-3">
                                    {AVATAR_COLORS.map(c => (
                                        <button key={c} onClick={() => setAvatarColor(c)}
                                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${c} transition-all shadow-lg ${avatarColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#050514] scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Kids toggle */}
                            <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                                <div>
                                    <p className="text-white font-black">وضع الأطفال 👶</p>
                                    <p className="text-gray-500 text-sm mt-1">محتوى مناسب للأطفال فقط</p>
                                </div>
                                <button onClick={() => setIsKids(!isKids)}
                                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${isKids ? 'bg-yellow-400' : 'bg-white/10'}`}>
                                    <motion.div animate={{ x: isKids ? 28 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className={`absolute top-0.5 w-6 h-6 rounded-full shadow-lg ${isKids ? 'bg-black' : 'bg-white/50'}`} />
                                </button>
                            </div>

                            <div className="flex justify-end">
                                <button onClick={() => setStep(1)} disabled={!profileName.trim()}
                                    className="px-10 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl shadow-xl disabled:opacity-40 transition-all hover:shadow-yellow-500/30 text-base">
                                    التالي ←
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 1: اهتمامات ── */}
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">ما هي اهتماماتك؟</h1>
                                <p className="text-gray-500">اختر حتى 8 فئات لتحصل على اقتراحات مخصصة</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {categories.map((cat, i) => {
                                    const sel = selectedCategories.includes(cat.id);
                                    return (
                                        <motion.button key={cat.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => toggleCat(cat.id)}
                                            disabled={!sel && selectedCategories.length >= 8}
                                            className={`relative p-4 rounded-2xl border text-right transition-all ${sel ? 'bg-yellow-400/15 border-yellow-400/50 text-white' : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:border-white/20 hover:text-white'} disabled:opacity-30`}>
                                            <div className="text-2xl mb-2">{CAT_EMOJIS[i % CAT_EMOJIS.length]}</div>
                                            <div className="font-bold text-sm">{cat.label}</div>
                                            {sel && <div className="absolute top-2 left-2 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow"><FiCheck className="text-black text-xs" /></div>}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(0)} className="text-gray-400 hover:text-white transition-colors font-bold px-6 py-3">→ رجوع</button>
                                <button onClick={() => setStep(2)}
                                    className="px-10 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl shadow-xl transition-all hover:shadow-yellow-500/30 text-base">
                                    التالي ({selectedCategories.length}/8) ←
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 2: أعمال مفضلة ── */}
                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">أعمالك المفضلة</h1>
                                <p className="text-gray-500">اختر حتى 10 أفلام أو مسلسلات تحبها</p>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {availableMedia.map(item => {
                                    const sel = selectedMedia.includes(item.id);
                                    return (
                                        <motion.button key={item.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                            onClick={() => toggleMedia(item.id)}
                                            disabled={!sel && selectedMedia.length >= 10}
                                            className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all disabled:opacity-30 ${sel ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#050514]' : 'opacity-60 hover:opacity-100'}`}>
                                            <img src={item.poster} alt="" className="w-full h-full object-cover" />
                                            {sel && (
                                                <div className="absolute inset-0 bg-yellow-400/20 flex items-start justify-end p-1.5">
                                                    <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                                        <FiCheck className="text-black text-xs" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                                <p className="text-white text-[10px] font-bold truncate">{item.titleAr || item.title}</p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="flex justify-between">
                                <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition-colors font-bold px-6 py-3">→ رجوع</button>
                                <button onClick={() => setStep(3)}
                                    className="px-10 py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl shadow-xl transition-all hover:shadow-yellow-500/30 text-base">
                                    التالي ({selectedMedia.length}/10) ←
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: تفاصيل ── */}
                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-black text-white mb-2">بعض التفاصيل</h1>
                                <p className="text-gray-500">تساعدنا في تخصيص تجربتك (اختياري)</p>
                            </div>

                            <div className="space-y-6 p-8 bg-white/[0.03] border border-white/[0.06] rounded-3xl">
                                {/* Gender */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">الجنس</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['ذكر', 'أنثى', 'أفضل عدم القول'].map(g => (
                                            <button key={g} onClick={() => setDetails(d => ({ ...d, gender: g }))}
                                                className={`px-6 py-2.5 rounded-xl border font-bold text-sm transition-all ${details.gender === g ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Age */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">الفئة العمرية</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['23 وأصغر', '24–34', '35–44', '45–55', '55 وأكبر'].map(a => (
                                            <button key={a} onClick={() => setDetails(d => ({ ...d, ageGroup: a }))}
                                                className={`px-5 py-2.5 rounded-xl border font-bold text-sm transition-all ${details.ageGroup === a ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>
                                                {a}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Kids */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">هل لديك أطفال؟</label>
                                    <div className="flex gap-3">
                                        {['نعم', 'لا'].map(k => (
                                            <button key={k} onClick={() => setDetails(d => ({ ...d, hasKids: k }))}
                                                className={`px-8 py-2.5 rounded-xl border font-bold text-sm transition-all ${details.hasKids === k ? 'bg-yellow-400 border-yellow-400 text-black' : 'bg-white/[0.03] border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}>
                                                {k}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">رقم الهاتف</label>
                                    <input type="tel" placeholder="05xxxxxxxx" value={details.phone}
                                        onChange={e => setDetails(d => ({ ...d, phone: e.target.value }))}
                                        className="w-full max-w-xs bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-400/40 transition-all font-bold"
                                        dir="ltr" />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold text-center">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white transition-colors font-bold px-6 py-3">→ رجوع</button>
                                <motion.button
                                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black rounded-2xl shadow-2xl shadow-yellow-500/30 disabled:opacity-50 text-base transition-all">
                                    {loading ? <div className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" /> : '✓'}
                                    {loading ? 'جاري الحفظ...' : 'إتمام الإنشاء'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
