import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdStar,
    MdMovieFilter, MdCheck, MdImage, MdLink, MdPlayCircle, MdDns
} from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import { getMovies, addMovie, updateMovie, deleteMovie } from '../../firebase/moviesService';
import { getCategories } from '../../firebase/categoriesService';
import TMDBSearchModal from '../components/TMDBSearchModal';

const QUALITIES = ['WEB-DL', 'BluRay', 'HDRip', '4K', 'CAM', 'HD', 'FHD', 'SCR', '720p', '1080p'];
const SERVER_TYPES = ['embed', 'direct', 'iframe', 'hls', 'mp4', 'other'];

const emptyServer = { name: '', quality: 'FHD', type: 'embed', watchLink: '', downloadLink: '' };

const emptyMovieForm = {
    title: '', titleAr: '', titleEn: '', overview: '', poster: '', backdrop: '', logo: '',
    year: '', rating: '', duration: '', introDuration: '', quality: 'WEB-DL', category: '',
    subcategory: '', genres: [], cast: [], servers: [],
    featured: false, tmdbId: null, type: 'movie'
};

// مكوّن سيرفر واحد
const ServerRow = ({ server, index, onChange, onDelete }) => (
    <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)' }}>
        <div className="flex items-center justify-between mb-1">
            <span className="text-yellow-400 text-xs font-bold font-arabic">سيرفر {index + 1}</span>
            <button onClick={onDelete} className="p-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">
                <MdDelete className="text-sm" />
            </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-gray-400 text-xs font-arabic mb-1 block">اسم السيرفر</label>
                <input value={server.name} onChange={e => onChange('name', e.target.value)}
                    placeholder="مثال: سيرفر 1" dir="rtl"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition font-arabic" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-gray-400 text-xs font-arabic mb-1 block">الجودة</label>
                    <select value={server.quality} onChange={e => onChange('quality', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-2 text-white text-xs focus:outline-none">
                        {QUALITIES.map(q => <option key={q} value={q} className="bg-[#12122a]">{q}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-gray-400 text-xs font-arabic mb-1 block">النوع</label>
                    <select value={server.type} onChange={e => onChange('type', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-2 text-white text-xs focus:outline-none">
                        {SERVER_TYPES.map(t => <option key={t} value={t} className="bg-[#12122a]">{t}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div>
            <label className="text-gray-400 text-xs font-arabic mb-1 block flex items-center gap-1"><MdPlayCircle className="text-green-400" /> رابط المشاهدة</label>
            <input value={server.watchLink} onChange={e => onChange('watchLink', e.target.value)}
                placeholder="https://..." dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-green-400/50 transition" />
        </div>
        <div>
            <label className="text-gray-400 text-xs font-arabic mb-1 block flex items-center gap-1"><MdLink className="text-blue-400" /> رابط التحميل</label>
            <input value={server.downloadLink} onChange={e => onChange('downloadLink', e.target.value)}
                placeholder="https://..." dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-blue-400/50 transition" />
        </div>
    </div>
);

// مودال الإضافة / التعديل
const MovieModal = ({ isOpen, onClose, onSave, editData, categories }) => {
    const [form, setForm] = useState(editData || emptyMovieForm);
    const [tmdbOpen, setTmdbOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('basic');

    useEffect(() => {
        setForm(editData || emptyMovieForm);
        setTab('basic');
    }, [editData, isOpen]);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleTMDBSelect = (data) => {
        setForm(prev => ({
            ...prev,
            title: data.titleAr || data.title,
            titleAr: data.titleAr,
            titleEn: data.titleEn,
            overview: data.overview,
            poster: data.poster,
            backdrop: data.backdrop,
            year: data.year,
            rating: data.rating,
            duration: data.duration,
            genres: data.genres,
            cast: data.cast,
            tmdbId: data.tmdbId,
        }));
    };

    const handleSave = async () => {
        if (!form.title || !form.poster) return alert('العنوان والصورة مطلوبان');
        setSaving(true);
        await onSave(form);
        setSaving(false);
        onClose();
    };

    const selectedCategory = categories.find(c => c.id === form.category);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col"
                    style={{
                        background: 'linear-gradient(135deg, #1a1a35, #12122a)',
                        border: '1px solid rgba(255,215,0,0.2)',
                        maxHeight: '90vh',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                                <BiCameraMovie className="text-black text-lg" />
                            </div>
                            <h3 className="text-white font-black font-arabic text-lg">
                                {editData ? 'تعديل الفيلم' : 'إضافة فيلم جديد'}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTmdbOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-arabic font-semibold text-black transition-all"
                                style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                            >
                                <MdSearch className="text-base" /> جلب من TMDB
                            </button>
                            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition">
                                <MdClose className="text-xl" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 flex-shrink-0 overflow-x-auto">
                        {[
                            { id: 'basic', label: 'بيانات أساسية' },
                            { id: 'servers', label: `سيرفرات (${form.servers?.length || 0})` },
                            { id: 'media', label: 'الصور' },
                            { id: 'cast', label: 'الممثلون' },
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex-shrink-0 flex-1 py-3 text-sm font-arabic font-semibold transition-all whitespace-nowrap px-2 ${tab === t.id ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {tab === 'basic' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="العنوان بالعربي *" value={form.titleAr} onChange={v => { set('titleAr', v); set('title', v); }} placeholder="اسم الفيلم بالعربي" />
                                    <Field label="العنوان بالإنجليزي" value={form.titleEn} onChange={v => set('titleEn', v)} placeholder="Movie title in English" />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">القصة / الوصف</label>
                                    <textarea
                                        value={form.overview}
                                        onChange={e => set('overview', e.target.value)}
                                        rows={4}
                                        placeholder="قصة الفيلم..."
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition font-arabic resize-none"
                                        dir="rtl"
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <Field label="السنة" value={form.year} onChange={v => set('year', v)} placeholder="2024" />
                                    <Field label="التقييم" value={form.rating} onChange={v => set('rating', v)} placeholder="8.5" />
                                    <Field label="المدة" value={form.duration} onChange={v => set('duration', v)} placeholder="2h 30m" />
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block flex items-center gap-1">
                                            <span className="text-yellow-400">⏭</span> مدة المقدمة (ثانية)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.introDuration || ''}
                                            onChange={e => set('introDuration', e.target.value)}
                                            placeholder="مثال: 90"
                                            min="0"
                                            className="w-full bg-yellow-400/10 border border-yellow-400/30 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400 transition font-arabic"
                                            dir="ltr"
                                        />
                                        <p className="text-gray-500 text-xs font-arabic mt-1">لتفعيل زر تخطي المقدمة</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">الجودة</label>
                                        <select value={form.quality} onChange={e => set('quality', e.target.value)}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition">
                                            {QUALITIES.map(q => <option key={q} value={q} className="bg-[#12122a]">{q}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">التصنيف الرئيسي</label>
                                        <select value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', ''); }}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition">
                                            <option value="" className="bg-[#12122a]">اختر تصنيفاً</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#12122a]">{c.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {selectedCategory?.subcategories?.length > 0 && (
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">التصنيف الفرعي</label>
                                        <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition">
                                            <option value="" className="bg-[#12122a]">اختر تصنيفاً فرعياً</option>
                                            {selectedCategory.subcategories.map(s => <option key={s.id} value={s.name} className="bg-[#12122a]">{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => set('featured', !form.featured)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${form.featured ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40' : 'bg-white/5 text-gray-400 border border-white/10'
                                            }`}
                                    >
                                        <MdStar /> {form.featured ? 'مميز' : 'غير مميز'}
                                    </button>
                                </div>
                            </>
                        )}

                        {tab === 'servers' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-white font-black font-arabic">سيرفرات المشاهدة</p>
                                        <p className="text-gray-400 text-xs font-arabic mt-0.5">أضف سيرفرات متعددة بجودات مختلفة</p>
                                    </div>
                                    <button
                                        onClick={() => set('servers', [...(form.servers || []), { ...emptyServer, name: `سيرفر ${(form.servers?.length || 0) + 1}` }])}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-black font-bold text-sm"
                                        style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                                    >
                                        <MdAdd /> إضافة سيرفر
                                    </button>
                                </div>

                                {(!form.servers || form.servers.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl"
                                        style={{ border: '2px dashed rgba(255,215,0,0.2)' }}>
                                        <MdDns className="text-5xl text-gray-600 mb-3" />
                                        <p className="text-gray-400 font-arabic mb-4">لا توجد سيرفرات بعد</p>
                                        <button
                                            onClick={() => set('servers', [{ ...emptyServer, name: 'سيرفر 1' }])}
                                            className="px-5 py-2.5 rounded-xl text-black font-bold text-sm"
                                            style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                                        >
                                            إضافة أول سيرفر
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {form.servers.map((srv, i) => (
                                            <ServerRow
                                                key={i}
                                                server={srv}
                                                index={i}
                                                onChange={(field, val) => {
                                                    const updated = [...form.servers];
                                                    updated[i] = { ...updated[i], [field]: val };
                                                    set('servers', updated);
                                                }}
                                                onDelete={() => {
                                                    const updated = form.servers.filter((_, idx) => idx !== i);
                                                    set('servers', updated);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {tab === 'media' && (
                            <>
                                <Field label="رابط صورة البوستر *" value={form.poster} onChange={v => set('poster', v)} placeholder="https://..." icon={MdImage} />
                                {form.poster && (
                                    <img src={form.poster} alt="" className="w-24 h-36 object-cover rounded-xl" />
                                )}
                                <Field label="رابط صورة الخلفية" value={form.backdrop} onChange={v => set('backdrop', v)} placeholder="https://..." icon={MdImage} />
                                {form.backdrop && (
                                    <img src={form.backdrop} alt="" className="w-full h-32 object-cover rounded-xl" />
                                )}
                                {/* Logo for Hero Banner */}
                                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,215,0,0.05)', border: '1px dashed rgba(255,215,0,0.3)' }}>
                                    <label className="text-yellow-400 text-sm font-arabic font-bold mb-1 flex items-center gap-2">
                                        ⭐ شعار العنوان PNG <span className="text-gray-400 font-normal text-xs">(اختياري — يظهر في الهيرو بدل النص)</span>
                                    </label>
                                    <input
                                        value={form.logo || ''}
                                        onChange={e => set('logo', e.target.value)}
                                        placeholder="https://... (رابط صورة PNG شفافة)"
                                        dir="ltr"
                                        className="w-full bg-white/5 border border-yellow-400/30 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition"
                                    />
                                    {form.logo && (
                                        <div className="mt-3 p-3 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                                            <img src={form.logo} alt="logo preview" className="max-h-20 object-contain" />
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {tab === 'cast' && (
                            <div className="space-y-4">
                                {form.cast?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {form.cast.map((actor, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <img src={actor.photo || 'https://via.placeholder.com/40'} alt={actor.name}
                                                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-semibold truncate">{actor.name}</p>
                                                    <p className="text-gray-400 text-xs truncate">{actor.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 font-arabic">
                                        اجلب البيانات من TMDB لإضافة الممثلين تلقائياً
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition text-sm font-arabic">
                            إلغاء
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-black font-bold text-sm transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                        >
                            <MdCheck />{saving ? 'جارٍ الحفظ...' : (editData ? 'حفظ التعديلات' : 'إضافة الفيلم')}
                        </button>
                    </div>
                </motion.div>

                <TMDBSearchModal
                    isOpen={tmdbOpen}
                    onClose={() => setTmdbOpen(false)}
                    onSelect={handleTMDBSelect}
                    type="movie"
                />
            </motion.div>
        </AnimatePresence>
    );
};

const Field = ({ label, value, onChange, placeholder, icon: Icon }) => (
    <div>
        <label className="text-gray-300 text-sm font-arabic mb-1 block">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />}
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white/5 border border-white/15 rounded-xl py-3 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition font-arabic ${Icon ? 'pr-10 pl-4' : 'px-4'}`}
                dir="rtl"
            />
        </div>
    </div>
);

// الصفحة الرئيسية لإدارة الأفلام
const MoviesManager = () => {
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editMovie, setEditMovie] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        setLoading(true);
        const [m, c] = await Promise.all([getMovies(), getCategories()]);
        setMovies(m);
        setCategories(c);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (form) => {
        if (editMovie) {
            await updateMovie(editMovie.id, form);
        } else {
            await addMovie(form);
        }
        await load();
    };

    const handleDelete = async (id) => {
        await deleteMovie(id);
        setDeleteConfirm(null);
        await load();
    };

    const filtered = movies.filter(m =>
        m.title?.toLowerCase().includes(search.toLowerCase()) ||
        m.titleAr?.includes(search) ||
        m.titleEn?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white font-arabic">إدارة الأفلام</h1>
                    <p className="text-gray-400 text-sm font-arabic">{movies.length} فيلم محفوظ</p>
                </div>
                <button
                    onClick={() => { setEditMovie(null); setModalOpen(true); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-black font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                >
                    <MdAdd className="text-lg" /> إضافة فيلم
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <MdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="بحث في الأفلام..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-yellow-400/50 transition font-arabic"
                    dir="rtl"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="rounded-xl bg-white/5 animate-pulse aspect-[2/3]" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <BiCameraMovie className="text-8xl text-gray-700 mb-4" />
                    <h3 className="text-xl font-black text-gray-400 font-arabic mb-2">لا توجد أفلام</h3>
                    <p className="text-gray-500 text-sm font-arabic mb-6">ابدأ بإضافة أول فيلم</p>
                    <button onClick={() => { setEditMovie(null); setModalOpen(true); }}
                        className="px-6 py-3 rounded-xl text-black font-bold"
                        style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                        إضافة فيلم الآن
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filtered.map((movie, i) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="group relative rounded-xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <div className="aspect-[2/3] relative overflow-hidden">
                                <img
                                    src={movie.poster || 'https://via.placeholder.com/200x300?text=No+Poster'}
                                    alt={movie.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditMovie(movie); setModalOpen(true); }}
                                            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-arabic font-semibold text-black"
                                            style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                                        >
                                            <MdEdit /> تعديل
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(movie)}
                                            className="flex items-center justify-center w-9 py-2 rounded-lg bg-red-500/80 text-white"
                                        >
                                            <MdDelete />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2" style={{ background: 'rgba(18,18,42,0.95)' }}>
                                <p className="text-white text-xs font-semibold font-arabic truncate">{movie.titleAr || movie.title}</p>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-gray-400 text-xs">{movie.year}</span>
                                    <div className="flex items-center gap-1">
                                        <MdStar className="text-yellow-400 text-xs" />
                                        <span className="text-yellow-400 text-xs">{movie.rating}</span>
                                    </div>
                                </div>
                                {movie.quality && (
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-black"
                                        style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                                        {movie.quality}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Movie Modal */}
            <MovieModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editData={editMovie}
                categories={categories}
            />

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="rounded-2xl p-6 max-w-sm w-full text-center"
                            style={{ background: '#1a1a35', border: '1px solid rgba(255,50,50,0.3)' }}
                        >
                            <MdDelete className="text-5xl text-red-400 mx-auto mb-3" />
                            <h3 className="text-white font-black font-arabic text-lg mb-2">حذف الفيلم؟</h3>
                            <p className="text-gray-400 text-sm font-arabic mb-5">
                                هل أنت متأكد من حذف "{deleteConfirm.titleAr || deleteConfirm.title}"؟
                            </p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">
                                    إلغاء
                                </button>
                                <button onClick={() => handleDelete(deleteConfirm.id)}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black font-arabic">
                                    حذف
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MoviesManager;
