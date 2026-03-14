import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd, MdDelete, MdClose, MdCheck, MdStar, MdMovieFilter,
    MdAutoAwesome, MdDashboard, MdCollections, MdInfoOutline,
    MdNavigateNext, MdNavigateBefore, MdRemoveCircleOutline,
    MdSearch, MdHistory, MdTrendingUp
} from 'react-icons/md';
import { BsArrowUp, BsArrowDown, BsFillPlayFill } from 'react-icons/bs';
import { getFeatured, addFeatured, removeFeatured, reorderFeatured } from '../../firebase/featuredService';
import { getMovies } from '../../firebase/moviesService';
import { getSeries } from '../../firebase/seriesService';
import { getCategories } from '../../firebase/categoriesService';

const FeaturedManager = () => {
    const [featured, setFeatured] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategoryId, setActiveCategoryId] = useState('home');
    const [loading, setLoading] = useState(true);
    const [addModal, setAddModal] = useState(false);
    const [search, setSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [previewIdx, setPreviewIdx] = useState(0);

    const load = async () => {
        setLoading(true);
        const [f, m, s, cats] = await Promise.all([
            getFeatured(activeCategoryId),
            getMovies(),
            getSeries(),
            getCategories()
        ]);
        setFeatured(f);
        setMovies(m);
        setSeries(s);
        const seriesCat = cats.find(c => c.icon === 'series');
        const seriesSubs = seriesCat?.subcategories?.map(s => ({ id: `series_${s.name}`, label: s.name })) || [];

        setCategories([
            { id: 'home', label: 'الرئيسية', icon: <MdDashboard /> },
            { id: 'movies', label: 'الأفلام', icon: <MdMovieFilter /> },
            { id: 'series', label: 'المسلسلات', icon: <MdCollections /> },
            ...seriesSubs.map(s => ({ ...s, icon: <MdCollections className="text-[10px]" /> })),
            { id: 'ramadan', label: 'رمضان', icon: <MdStar /> },
            { id: 'kids', label: 'أطفال', icon: <MdAutoAwesome /> },
        ]);
        setLoading(false);
    };

    useEffect(() => { load(); }, [activeCategoryId]);

    // Simple auto-slide for the admin preview
    useEffect(() => {
        if (featured.length > 1) {
            const timer = setInterval(() => {
                setPreviewIdx(prev => (prev + 1) % featured.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [featured]);

    const allContent = [
        ...movies.map(m => ({
            contentId: m.id,
            type: 'movie',
            title: m.titleAr || m.title,
            titleEn: m.titleEn || m.title,
            poster: m.poster,
            backdrop: m.backdrop,
            logo: m.logo || m.titleLogo || m.logoUrl || m.title_logo,
            titleLogo: m.titleLogo || m.logo || m.logoUrl || m.title_logo,
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
            logo: s.logo || s.titleLogo || s.logoUrl || s.title_logo,
            titleLogo: s.titleLogo || s.logo || s.logoUrl || s.title_logo,
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
        if (featured.length >= 7) return alert('الحد الأقصى 7 عناصر');
        await addFeatured({ ...item, order: featured.length + 1 }, activeCategoryId);
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
        <div className="space-y-10 pb-20 select-none">
            {/* --- HERO HUB HEADER --- */}
            <div className="relative overflow-hidden rounded-3xl md:rounded-[2rem] p-6 md:p-8 text-white shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-right">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-center md:justify-start gap-3 mb-3">
                            <div className="p-2 md:p-2.5 bg-yellow-400/20 rounded-xl md:rounded-xl border border-yellow-400/30">
                                <MdAutoAwesome className="text-xl md:text-2xl text-yellow-400 animate-pulse" />
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black font-arabic tracking-tight">
                                مركز الكافر المميز
                            </h1>
                        </motion.div>
                        <p className="text-gray-400 font-arabic text-sm md:text-base max-w-xl mx-auto md:mx-0">
                            قم بإدارة المحتوى الذي يظهر في مقدمة الموقع (Hero Banner). يمكنك إضافة حتى 7 عناصر مذهلة لكل تصنيف.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <div className="flex -space-x-4 mb-2">
                            {featured.map((f, i) => (
                                <motion.img key={i} src={f.poster} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}
                                    className="w-12 h-16 object-cover rounded-xl border-2 border-[#1a1a35] shadow-xl" />
                            ))}
                            {featured.length === 0 && <div className="w-12 h-16 rounded-xl bg-white/5 border-2 border-dashed border-white/20" />}
                        </div>
                        <button
                            onClick={() => { setAddModal(true); setSearch(''); }}
                            className="group relative flex items-center gap-2 px-6 py-3 rounded-xl text-black font-black text-sm md:text-base font-arabic transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                            style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)' }}
                        >
                            <MdAdd className="text-xl" /> إضافة محتوى جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CATEGORY SELECTOR & STATS --- */}
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between px-2">
                <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar w-full lg:w-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategoryId(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-arabic font-bold transition-all whitespace-nowrap border-2 ${activeCategoryId === cat.id
                                ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.2)]'
                                : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <div className="px-4 py-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20 text-center">
                        <p className="text-[10px] text-gray-400 font-arabic mb-0.5">العناصر النشطة</p>
                        <p className="text-yellow-400 font-black text-xl">{featured.length}/7</p>
                    </div>
                    <div className="h-10 w-px bg-white/10" />
                    <div className="px-4 py-2 bg-blue-400/10 rounded-xl border border-blue-400/20 text-center">
                        <p className="text-[10px] text-gray-400 font-arabic mb-0.5">التصنيف الحالي</p>
                        <p className="text-blue-400 font-black text-sm font-arabic">{categories.find(c => c.id === activeCategoryId)?.label}</p>
                    </div>
                </div>
            </div>

            {/* --- LIVE PREVIEW MOCKUP --- */}
            {featured.length > 0 && (
                <div className="relative group mx-2">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-3xl md:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
                    <div className="relative bg-[#0a0a1f] rounded-3xl md:rounded-3xl border border-white/10 h-[300px] md:h-[320px] overflow-hidden shadow-2xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={featured[previewIdx]?.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1 }}
                                className="absolute inset-0"
                            >
                                <img src={featured[previewIdx]?.backdrop || featured[previewIdx]?.poster} className="w-full h-full object-cover" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-l from-[#0a0a1f] via-[#0a0a1f]/60 to-transparent" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1f] to-transparent" />

                                <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:w-2/3 flex flex-col justify-end md:justify-center p-6 md:px-12 text-center md:text-right bg-gradient-to-t from-[#0a0a1f] via-[#0a0a1f]/80 to-transparent md:bg-none">
                                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                                        {featured[previewIdx]?.logo ? (
                                            <img src={featured[previewIdx].logo} className="h-12 md:h-16 object-contain mb-3 drop-shadow-2xl mx-auto md:mr-0 md:ml-auto" alt="" />
                                        ) : (
                                            <h2 className="text-2xl md:text-3xl font-black text-white font-arabic mb-3 drop-shadow-lg">{featured[previewIdx]?.title}</h2>
                                        )}
                                        <div className="flex items-center justify-center md:justify-end gap-3 mb-3 md:mb-4 text-xs md:text-sm">
                                            <span className="text-yellow-400 font-bold">⭐ {featured[previewIdx]?.rating}</span>
                                            <span className="text-white/60">•</span>
                                            <span className="text-white/60">{featured[previewIdx]?.year}</span>
                                            <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] text-white">{featured[previewIdx]?.quality}</span>
                                        </div>
                                        <p className="text-gray-300 text-[10px] md:text-sm font-arabic leading-relaxed line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 max-w-md mx-auto md:mr-0 md:ml-auto">
                                            {featured[previewIdx]?.description}
                                        </p>
                                        <div className="flex items-center justify-center md:justify-end gap-3 md:gap-4 pb-4 md:pb-0">
                                            <button className="px-6 md:px-8 py-2 md:py-3 bg-yellow-400 text-black font-black rounded-xl font-arabic text-xs md:text-sm shadow-xl">مشاهدة</button>
                                            <button className="px-6 md:px-8 py-2 md:py-3 bg-white/10 text-white font-bold rounded-xl font-arabic text-xs md:text-sm backdrop-blur-md">+ المفضلة</button>
                                        </div>
                                    </motion.div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Preview Navigation */}
                        <div className="absolute bottom-6 right-12 flex items-center gap-3 z-20">
                            {featured.map((_, i) => (
                                <button key={i} onClick={() => setPreviewIdx(i)}
                                    className={`h-1 rounded-full transition-all duration-500 ${previewIdx === i ? 'w-8 bg-yellow-400' : 'w-2 bg-white/30'}`} />
                            ))}
                        </div>
                        <div className="absolute top-4 md:top-6 left-4 md:left-6 flex items-center gap-2 bg-black/40 backdrop-blur-xl px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/10 z-20">
                            <MdInfoOutline className="text-yellow-400" />
                            <span className="text-white text-xs font-arabic">معاينة مباشرة للبانر الأصلي</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FEATURED ITEMS GRID --- */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                    ))}
                </div>
            ) : featured.length === 0 ? (
                <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-8xl mb-6">✨</motion.div>
                    <p className="text-gray-300 font-arabic text-2xl font-black">المكان هنا خالي تماماً!</p>
                    <p className="text-gray-500 font-arabic mt-4 max-w-sm mx-auto">أضف بعض السحر لواجهة موقعك عبر اختيار أفضل الأفلام والمسلسلات لتظهر كـ Hero Banner.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {featured.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group relative bg-[#1a1a35] rounded-3xl md:rounded-3xl border border-white/5 overflow-hidden shadow-xl transition-all hover:border-yellow-400/40 hover:shadow-yellow-400/10"
                        >
                            {/* Card Background Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
                            <img src={item.poster} alt="" className="w-full h-64 md:h-72 object-cover group-hover:scale-110 transition-transform duration-700" />

                            {/* Order Badge */}
                            <div className="absolute top-4 right-4 z-20 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#000' }}>
                                {idx + 1}
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute inset-0 z-20 p-6 flex flex-col justify-end">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-3 py-1 rounded-lg font-black font-arabic uppercase tracking-wider ${item.type === 'movie' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                                            {item.type === 'movie' ? '🎬 فيلم' : '📺 مسلسل'}
                                        </span>
                                        {item.quality && <span className="text-[10px] px-2 py-1 bg-white/10 text-white rounded-lg font-bold">{item.quality}</span>}
                                    </div>
                                    <h3 className="text-xl font-black text-white font-arabic line-clamp-1">{item.title}</h3>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleMove(idx, -1)} disabled={idx === 0}
                                                className="p-3 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20">
                                                <BsArrowUp className="text-lg" />
                                            </button>
                                            <button onClick={() => handleMove(idx, 1)} disabled={idx === featured.length - 1}
                                                className="p-3 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20">
                                                <BsArrowDown className="text-lg" />
                                            </button>
                                        </div>
                                        <button onClick={() => setDeleteConfirm(item)}
                                            className="group/del flex items-center gap-2 px-5 py-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all font-arabic font-black text-xs">
                                            <MdDelete className="text-lg group-hover/del:animate-bounce" /> إزالة
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* --- ADD CONTENT MODAL --- */}
            <AnimatePresence>
                {addModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                        style={{ background: 'rgba(5, 5, 20, 0.85)', backdropFilter: 'blur(15px)' }}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-5xl rounded-3xl md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-[80vh]"
                            style={{ background: '#0f0f2a', border: '1px solid rgba(255,215,0,0.15)', boxShadow: '0 0 100px rgba(0,0,0,0.5)' }}>

                            {/* Sidebar Info */}
                            <div className="w-full md:w-80 bg-[#15153a] p-8 border-b md:border-b-0 md:border-l border-white/5 flex flex-col justify-between">
                                <div>
                                    <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center text-black mb-6 shadow-lg shadow-yellow-400/20">
                                        <MdCollections className="text-4xl" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white font-arabic mb-4 leading-tight">اختر المحتوى المميز</h3>
                                    <p className="text-gray-400 text-sm font-arabic leading-relaxed mb-8">
                                        ابحث عن أفلامك ومسلسلاتك المفضلة وأضفها للبانر الرئيسي لهذا التصنيف.
                                    </p>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-gray-400 text-xs font-arabic">
                                            <MdHistory className="text-yellow-400" /> مضاف مؤخراً
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-400 text-xs font-arabic">
                                            <MdTrendingUp className="text-emerald-400" /> الأكثر رواجاً
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => setAddModal(false)}
                                    className="w-full py-4 rounded-2xl bg-white/5 text-gray-400 font-bold font-arabic hover:bg-white/10 transition-all border border-white/5">
                                    إغلاق النافذة
                                </button>
                            </div>

                            {/* Main Selection Area */}
                            <div className="flex-1 flex flex-col">
                                {/* Search Header */}
                                <div className="p-6 md:p-8 border-b border-white/5">
                                    <div className="relative group">
                                        <MdSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 text-2xl group-focus-within:text-yellow-400 transition-colors" />
                                        <input value={search} onChange={e => setSearch(e.target.value)}
                                            placeholder="ابحث بالعربي أو الإنجليزي..." dir="rtl"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pr-14 pl-6 text-white text-lg focus:outline-none focus:border-yellow-400/60 focus:bg-white/[0.08] transition-all font-arabic shadow-inner" />
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                                    {allContent.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center">
                                            <div className="text-6xl mb-4 opacity-20">🔍</div>
                                            <p className="text-gray-500 font-arabic text-lg">لم نعثر على أي نتائج مطابقة</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {allContent.map(item => {
                                                const added = isAdded(item.contentId, item.type);
                                                return (
                                                    <motion.div key={`${item.type}-${item.contentId}`}
                                                        whileHover={!added ? { y: -5 } : {}}
                                                        className={`relative group rounded-2xl overflow-hidden aspect-[2/3] transition-all ${added ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer'}`}
                                                        onClick={() => handleAdd(item)}
                                                    >
                                                        <img src={item.poster || 'https://via.placeholder.com/200x300'} alt=""
                                                            className="w-full h-full object-cover" />
                                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                            <p className="text-white text-[10px] font-black font-arabic truncate mb-1">{item.title}</p>
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black font-arabic text-white ${item.type === 'movie' ? 'bg-orange-500' : 'bg-cyan-500'}`}>
                                                                    {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
                                                                </span>
                                                                <span className="text-[8px] text-yellow-400 font-black">⭐ {item.rating}</span>
                                                            </div>
                                                        </div>

                                                        {added ? (
                                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center border-4 border-emerald-500/50">
                                                                <div className="bg-emerald-500 p-2 rounded-full shadow-lg">
                                                                    <MdCheck className="text-3xl text-white" />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="absolute inset-0 bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="bg-yellow-400 p-4 rounded-3xl text-black shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                                                                    <MdAdd className="text-3xl" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- DELETE CONFIRM MODAL --- */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#1a1a35] rounded-3xl md:rounded-[3rem] p-8 md:p-10 max-w-md w-full text-center border border-red-500/20 shadow-[0_0_100px_rgba(255,0,0,0.1)]">
                            <div className="relative w-24 h-24 mx-auto mb-8">
                                <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                                <div className="relative bg-red-500/10 border border-red-500/30 rounded-full w-full h-full flex items-center justify-center text-red-500">
                                    <MdRemoveCircleOutline className="text-5xl" />
                                </div>
                            </div>
                            <h3 className="text-white text-2xl font-black font-arabic mb-4">هل أنت متأكد؟</h3>
                            <p className="text-gray-400 font-arabic mb-2">سيتم إزالة <span className="text-white font-bold">"{deleteConfirm.title}"</span> من قائمة الكافر المميز.</p>
                            <p className="text-gray-600 text-sm font-arabic mb-10">لن يحذف هذا المحتوى من النظام.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="py-4 rounded-2xl bg-white/5 text-gray-400 font-bold font-arabic hover:bg-white/10 transition-all border border-white/5">
                                    تراجع
                                </button>
                                <button onClick={() => handleRemove(deleteConfirm.id)}
                                    className="py-4 rounded-2xl bg-red-500 text-white font-black font-arabic shadow-xl shadow-red-500/20 hover:scale-105 transition-all">
                                    تأكيد الحذف
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeaturedManager;
