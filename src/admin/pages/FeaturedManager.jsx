import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdDelete, MdClose, MdCheck, MdStar, MdMovieFilter } from 'react-icons/md';
import { BsArrowUp, BsArrowDown } from 'react-icons/bs';
import { getFeatured, addFeatured, removeFeatured, reorderFeatured } from '../../firebase/featuredService';
import { getMovies } from '../../firebase/moviesService';
import { getSeries } from '../../firebase/seriesService';

const FeaturedManager = () => {
    const [featured, setFeatured] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addModal, setAddModal] = useState(false);
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        setLoading(true);
        const [f, m, s] = await Promise.all([getFeatured(), getMovies(), getSeries()]);
        setFeatured(f);
        setMovies(m);
        setSeries(s);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const allContent = [
        ...movies.map(m => ({
            contentId: m.id,
            type: 'movie',
            title: m.titleAr || m.title,
            titleEn: m.titleEn || m.title,
            poster: m.poster,
            backdrop: m.backdrop,
            logo: m.logo,
            rating: m.rating,
            year: m.year,
            quality: m.quality,
            duration: m.duration,
            country: m.country,
            description: m.overview || m.description || m.story,
            genres: m.genres || (m.genre ? [m.genre] : []),
        })),
        ...series.map(s => ({
            contentId: s.id,
            type: 'series',
            title: s.titleAr || s.title,
            titleEn: s.titleEn || s.title,
            poster: s.poster,
            backdrop: s.backdrop,
            logo: s.logo,
            rating: s.rating,
            year: s.year,
            quality: s.quality,
            duration: s.episodeDuration,
            country: s.country,
            description: s.overview || s.description || s.story,
            genres: s.genres || (s.genre ? [s.genre] : []),
        })),
    ].filter(item =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.titleEn?.toLowerCase().includes(search.toLowerCase())
    );

    const isAdded = (contentId, type) => featured.some(f => f.contentId === contentId && f.type === type);

    const handleAdd = async (item) => {
        if (isAdded(item.contentId, item.type)) return;
        if (featured.length >= 7) return alert('الحد الأقصى 7 عناصر في الكافر');
        await addFeatured({ ...item, order: featured.length + 1 });
        await load();
    };

    const handleRemove = async (id) => {
        await removeFeatured(id);
        setDeleteConfirm(null);
        await load();
    };

    const handleMove = async (idx, dir) => {
        const newOrder = [...featured];
        const target = idx + dir;
        if (target < 0 || target >= newOrder.length) return;
        [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
        for (let i = 0; i < newOrder.length; i++) newOrder[i] = { ...newOrder[i], order: i + 1 };
        setFeatured(newOrder);
        await reorderFeatured(newOrder);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white font-arabic flex items-center gap-2">
                        <MdMovieFilter className="text-yellow-400" />
                        الكافر المميز (Hero Banner)
                    </h1>
                    <p className="text-gray-400 text-sm font-arabic mt-1">
                        {featured.length}/7 عنصر · يظهر في الصفحة الرئيسية
                    </p>
                </div>
                <button
                    onClick={() => { setAddModal(true); setSearch(''); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-black font-bold text-sm font-arabic"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                >
                    <MdAdd /> إضافة للكافر
                </button>
            </div>

            {/* Preview info */}
            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)' }}>
                <MdStar className="text-yellow-400 text-2xl flex-shrink-0" />
                <p className="text-gray-300 text-sm font-arabic">
                    العناصر هنا تظهر كـ <strong className="text-yellow-400">Hero Banner</strong> في الصفحة الرئيسية · يتم التبديل بينها تلقائياً كل 8 ثوان · الحد الأقصى 7 عناصر
                </p>
            </div>

            {/* Featured List */}
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : featured.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-400 font-arabic text-lg">لا يوجد محتوى مميز بعد</p>
                    <p className="text-gray-600 font-arabic text-sm mt-2">أضف أفلام أو مسلسلات لتظهر في الكافر الرئيسي</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {featured.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-4 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {/* Order Badge */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#000' }}>
                                {idx + 1}
                            </div>

                            {/* Poster */}
                            <img src={item.poster || 'https://via.placeholder.com/60x90'} alt={item.title}
                                className="w-12 h-16 object-cover rounded-lg flex-shrink-0" />

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold font-arabic truncate">{item.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-arabic ${item.type === 'movie' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                        {item.type === 'movie' ? '🎬 فيلم' : '📺 مسلسل'}
                                    </span>
                                    {item.year && <span className="text-gray-500 text-xs">{item.year}</span>}
                                    {item.rating && <span className="text-yellow-500 text-xs">⭐ {item.rating}</span>}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => handleMove(idx, -1)} disabled={idx === 0}
                                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                                    <BsArrowUp />
                                </button>
                                <button onClick={() => handleMove(idx, 1)} disabled={idx === featured.length - 1}
                                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition disabled:opacity-20">
                                    <BsArrowDown />
                                </button>
                                <button onClick={() => setDeleteConfirm(item)}
                                    className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 border border-red-400/20 transition">
                                    <MdDelete />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {addModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-xl rounded-2xl overflow-hidden"
                            style={{ background: '#0f0f2a', border: '1px solid rgba(255,215,0,0.2)', maxHeight: '80vh' }}>
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <h3 className="text-white font-black font-arabic">اختر محتوى للكافر</h3>
                                <button onClick={() => setAddModal(false)} className="text-gray-400 hover:text-white"><MdClose /></button>
                            </div>
                            {/* Search */}
                            <div className="p-4 border-b border-white/10">
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="بحث عن فيلم أو مسلسل..." dir="rtl"
                                    className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition font-arabic" />
                            </div>
                            {/* Content List */}
                            <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                                {allContent.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500 font-arabic text-sm">لا توجد نتائج</div>
                                ) : allContent.map(item => {
                                    const added = isAdded(item.contentId, item.type);
                                    return (
                                        <button key={`${item.type}-${item.contentId}`}
                                            onClick={() => handleAdd(item)}
                                            disabled={added}
                                            className={`w-full flex items-center gap-4 px-5 py-3.5 border-b border-white/5 text-right transition-all ${added ? 'opacity-40' : 'hover:bg-white/5'}`}>
                                            <img src={item.poster || 'https://via.placeholder.com/40x60'} alt=""
                                                className="w-9 h-13 object-cover rounded-lg flex-shrink-0" style={{ width: '36px', height: '54px' }} />
                                            <div className="flex-1 min-w-0 text-right">
                                                <p className="text-white text-sm font-arabic font-bold truncate">{item.title}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-arabic ${item.type === 'movie' ? 'bg-orange-500/30 text-orange-400' : 'bg-cyan-500/30 text-cyan-400'}`}>
                                                        {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
                                                    </span>
                                                    {item.year && <span className="text-gray-500 text-xs">{item.year}</span>}
                                                </div>
                                            </div>
                                            {added
                                                ? <MdCheck className="text-green-400 flex-shrink-0" />
                                                : <MdAdd className="text-gray-400 flex-shrink-0" />
                                            }
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.9)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-2xl p-6 max-w-sm w-full text-center"
                            style={{ background: '#1a1a35', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <MdDelete className="text-5xl text-red-400 mx-auto mb-3" />
                            <p className="text-white font-bold font-arabic mb-2">{deleteConfirm.title}</p>
                            <p className="text-gray-400 text-sm font-arabic mb-5">سيُحذف من الكافر الرئيسي</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={() => handleRemove(deleteConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black font-arabic">حذف</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeaturedManager;
