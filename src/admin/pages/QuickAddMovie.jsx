import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMovieFilter, MdLink, MdSearch, MdCheckCircle, MdError, MdAdd } from 'react-icons/md';
import { addMovieByName } from '../../services/apiMovieService';

// ── مكوّن بطاقة المعاينة ──────────────────────────────────────────────────────
const PreviewCard = ({ data }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 p-4 rounded-2xl mt-4"
        style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}
    >
        {data.poster && (
            <img
                src={data.poster}
                alt={data.title}
                className="w-20 h-28 object-cover rounded-xl flex-shrink-0"
            />
        )}
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-yellow-400 text-lg truncate">{data.titleAr || data.title}</h3>
            <p className="text-gray-400 text-xs mt-0.5">{data.titleEn}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                {data.year && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{data.year}</span>
                )}
                {data.rating && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300">⭐ {data.rating}</span>
                )}
                {data.duration && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{data.duration}</span>
                )}
            </div>
            {data.overview && (
                <p className="text-gray-400 text-xs mt-2 line-clamp-3 leading-relaxed">{data.overview}</p>
            )}
            {data.genres?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {data.genres.slice(0, 3).map(g => (
                        <span key={g} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{g}</span>
                    ))}
                </div>
            )}
        </div>
    </motion.div>
);

// ── الصفحة الرئيسية ───────────────────────────────────────────────────────────
const QuickAddMovie = () => {
    const [movieName, setMovieName] = useState('');
    const [m3u8Url, setM3u8Url] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { success, data, movieId, error }
    const [history, setHistory] = useState([]);   // آخر الأفلام المضافة

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!movieName.trim() || !m3u8Url.trim()) return;

        setLoading(true);
        setResult(null);

        const res = await addMovieByName({ movieName, m3u8Url });
        setResult(res);

        if (res.success) {
            setHistory(prev => [{ ...res.data, movieId: res.movieId, addedAt: new Date() }, ...prev].slice(0, 5));
            setMovieName('');
            setM3u8Url('');
        }

        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto" dir="rtl">
            {/* ── عنوان الصفحة ─────────────────────────────────────────────── */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)' }}>
                        <MdAdd className="text-black text-xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-white font-arabic">إضافة فيلم سريعة</h1>
                </div>
                <p className="text-gray-400 text-sm font-arabic mr-13">
                    أدخل اسم الفيلم ورابط البث، وسيتم جلب كل التفاصيل من TMDB تلقائياً وحفظها في قاعدة البيانات.
                </p>
            </div>

            {/* ── النموذج ──────────────────────────────────────────────────── */}
            <form onSubmit={handleSubmit}
                className="rounded-2xl p-6 space-y-5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
                {/* حقل اسم الفيلم */}
                <div>
                    <label className="block text-sm font-semibold text-gray-300 font-arabic mb-2">
                        اسم الفيلم
                    </label>
                    <div className="relative">
                        <MdMovieFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="text"
                            value={movieName}
                            onChange={e => setMovieName(e.target.value)}
                            placeholder="مثال: Inception أو البداية"
                            required
                            disabled={loading}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition font-arabic disabled:opacity-50"
                        />
                    </div>
                </div>

                {/* حقل رابط m3u8 */}
                <div>
                    <label className="block text-sm font-semibold text-gray-300 font-arabic mb-2">
                        رابط البث (m3u8)
                    </label>
                    <div className="relative">
                        <MdLink className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                        <input
                            type="url"
                            value={m3u8Url}
                            onChange={e => setM3u8Url(e.target.value)}
                            placeholder="https://example.com/stream.m3u8"
                            required
                            disabled={loading}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-10 pl-4 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition font-arabic disabled:opacity-50"
                            dir="ltr"
                        />
                    </div>
                </div>

                {/* زر الإرسال */}
                <motion.button
                    type="submit"
                    disabled={loading || !movieName.trim() || !m3u8Url.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-bold font-arabic text-black flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg,#ffd700,#ff8c00)' }}
                >
                    {loading ? (
                        <>
                            <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="inline-block w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                            />
                            جارٍ البحث والحفظ…
                        </>
                    ) : (
                        <>
                            <MdSearch className="text-xl" />
                            بحث وإضافة الفيلم
                        </>
                    )}
                </motion.button>
            </form>

            {/* ── نتيجة العملية ────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mt-5"
                    >
                        {result.success ? (
                            <div className="rounded-2xl p-4"
                                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
                                <div className="flex items-center gap-2 text-green-400 font-arabic font-semibold mb-1">
                                    <MdCheckCircle className="text-xl flex-shrink-0" />
                                    تمت الإضافة بنجاح! 🎉
                                </div>
                                <p className="text-gray-400 text-xs font-arabic">
                                    ID في قاعدة البيانات: <span className="text-green-300 font-mono">{result.movieId}</span>
                                </p>
                                {/* معاينة الفيلم */}
                                <PreviewCard data={result.data} />
                            </div>
                        ) : (
                            <div className="rounded-2xl p-4 flex items-start gap-3"
                                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                                <MdError className="text-red-400 text-xl flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-400 font-semibold font-arabic text-sm">فشلت العملية</p>
                                    <p className="text-gray-400 text-xs mt-0.5 font-arabic">{result.error}</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── سجل آخر الإضافات ─────────────────────────────────────────── */}
            {history.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-base font-bold text-gray-300 font-arabic mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-5 rounded-full inline-block" style={{ background: 'linear-gradient(#ffd700,#ff8c00)' }} />
                        آخر الأفلام المضافة في هذه الجلسة
                    </h2>
                    <div className="space-y-3">
                        {history.map((item, i) => (
                            <motion.div
                                key={item.movieId || i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                {item.poster && (
                                    <img src={item.poster} alt={item.title}
                                        className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm truncate">{item.titleAr || item.title}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{item.year} · {item.rating} ⭐</p>
                                </div>
                                <MdCheckCircle className="text-green-400 text-lg flex-shrink-0" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickAddMovie;
