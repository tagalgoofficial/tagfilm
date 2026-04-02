import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdStar,
    MdMovieFilter, MdCheck, MdImage, MdLink, MdPlayCircle, MdDns
} from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import { getMovies, addMovie, updateMovie, deleteMovie, addPart, updatePart, deletePart } from '../../firebase/moviesService';
import { getCategories, initDefaultCategories } from '../../firebase/categoriesService';
import { getMovieFolders, addMovieFolder, updateMovieFolder, deleteMovieFolder } from '../../firebase/movieFoldersService';
import TMDBSearchModal from '../components/TMDBSearchModal';
import BulkUrlReplacerModal from '../components/BulkUrlReplacerModal';
import TagAlgoPickerModal from '../components/TagAlgoPickerModal';
import { searchMovies, getMovieDetails } from '../../services/tmdbService';
import { MdFolder, MdFolderOpen, MdSettings } from 'react-icons/md';

const QUALITIES = ['WEB-DL', 'BluRay', 'HDRip', '4K', 'CAM', 'HD', 'FHD', 'SCR', '720p', '1080p'];
const SERVER_TYPES = ['embed', 'direct', 'iframe', 'hls', 'mp4', 'other'];

const emptyServer = { name: '', quality: 'FHD', type: 'embed', watchLink: '', downloadLink: '' };

const emptyMovieForm = {
    title: '', titleAr: '', titleEn: '', overview: '', poster: '', backdrop: '', logo: '',
    year: '', rating: '', duration: '', introDuration: '', quality: 'WEB-DL', category: '',
    subcategories: [], genres: [], cast: [], servers: [], parts: [],
    folderId: '',
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

// مكوّن حقل إدخال بسيط
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

// مودال الإضافة / التعديل
const MovieModal = ({ isOpen, onClose, onSave, editData, categories, folders }) => {
    const [form, setForm] = useState(editData || emptyMovieForm);
    const [tmdbOpen, setTmdbOpen] = useState(false);
    const [tmdbQuery, setTmdbQuery] = useState('');
    const [tagAlgoOpen, setTagAlgoOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('basic');

    useEffect(() => {
        setForm(editData || emptyMovieForm);
        setTab('basic');
    }, [editData, isOpen]);

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleTMDBSelect = (data) => {
        // محاولة تخمين التصنيف بناءً على الأنواع (Genres)
        let guessedCategory = form.category;
        if (!guessedCategory && data.genres && data.genres.length > 0) {
            const match = categories.find(c =>
                data.genres.some(g => c.label.includes(g) || g.includes(c.label))
            );
            if (match) guessedCategory = match.id;
        }

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
            logo: data.logo,
            tmdbId: data.tmdbId,
            category: guessedCategory,
        }));
    };

    const autoFetchTMDB = async (name) => {
        if (!name) return;
        try {
            const results = await searchMovies(name);
            if (results && results.length > 0) {
                const details = await getMovieDetails(results[0].id);
                handleTMDBSelect(details);
            }
        } catch (err) {
            console.error("Auto TMDB fetch failed:", err);
        }
    };

    const handleSave = async () => {
        if (!form.title && !form.poster) return alert('العنوان والصورة مطلوبان');
        setSaving(true);
        await onSave(form);
        setSaving(false);
        setTmdbQuery(''); // Reset query
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
                            <button
                                onClick={() => setTagAlgoOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-arabic font-semibold text-white border border-green-400/40 hover:border-green-400/80 transition-all"
                                style={{ background: 'linear-gradient(135deg, rgba(0,255,128,0.1), rgba(0,179,89,0.1))' }}
                            >
                                <span className="text-green-400 text-base">🌐</span> TagAlgo
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
                                        <select value={form.category} onChange={e => { set('category', e.target.value); set('subcategories', []); }}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition">
                                            <option value="" className="bg-[#12122a]">اختر تصنيفاً</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#12122a]">{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">المجلد (Folder)</label>
                                        <select value={form.folderId} onChange={e => set('folderId', e.target.value)}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition">
                                            <option value="" className="bg-[#12122a]">بدون مجلد</option>
                                            {folders?.map(f => <option key={f.id} value={f.id} className="bg-[#12122a]">{f.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {selectedCategory?.subcategories?.length > 0 && (
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-2 block">التصنيفات الفرعية (يمكنك اختيار أكثر من واحد)</label>
                                        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-white/5 border border-white/10 min-h-[60px]">
                                            {selectedCategory.subcategories.map(s => {
                                                const isSelected = form.subcategories?.includes(s.name);
                                                return (
                                                    <button
                                                        key={s.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const current = form.subcategories || [];
                                                            if (isSelected) {
                                                                set('subcategories', current.filter(name => name !== s.name));
                                                            } else {
                                                                set('subcategories', [...current, s.name]);
                                                            }
                                                        }}
                                                        className={`px-4 py-2 rounded-xl text-xs font-arabic font-bold transition-all border ${isSelected
                                                            ? 'bg-yellow-400 text-black border-transparent shadow-lg shadow-yellow-400/20'
                                                            : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                                                            }`}
                                                    >
                                                        {s.name}
                                                        {isSelected && <MdCheck className="inline-block mr-1" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
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
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setTagAlgoOpen(true)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-sm border border-green-400/40 hover:border-green-400/80 transition-all"
                                            style={{ background: 'linear-gradient(135deg, rgba(0,255,128,0.15), rgba(0,179,89,0.15))' }}
                                        >
                                            <span className="text-green-400 text-base">🌐</span> TagAlgo
                                        </button>
                                        <button
                                            onClick={() => set('servers', [...(form.servers || []), { ...emptyServer, name: `سيرفر ${(form.servers?.length || 0) + 1}` }])}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-black font-bold text-sm"
                                            style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                                        >
                                            <MdAdd /> إضافة سيرفر
                                        </button>
                                    </div>
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
                    onClose={() => { setTmdbOpen(false); setTmdbQuery(''); }}
                    onSelect={handleTMDBSelect}
                    initialQuery={tmdbQuery}
                    type="movie"
                />
                <TagAlgoPickerModal
                    isOpen={tagAlgoOpen}
                    onClose={() => setTagAlgoOpen(false)}
                    onSelect={(srv) => {
                        set('servers', [...(form.servers || []), srv]);
                        if (srv.videoName) {
                            const cleanName = srv.videoName;
                            if (!form.titleAr && !form.title) {
                                set('titleAr', cleanName);
                                set('title', cleanName);
                                autoFetchTMDB(cleanName); // جلب تلقائي بالكامل
                            }
                        }
                    }}
                />
            </motion.div>
        </AnimatePresence>
    );
};

const MovieDetailsModal = ({ isOpen, onClose, movie, categories }) => {
    if (!isOpen || !movie) return null;

    const categoryLabel = categories.find(c => c.id === movie.category)?.label || 'بدون تصنيف';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
                style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)' }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-4xl bg-[#0a0a1a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col max-h-[90vh]"
                >
                    {/* Backdrop Header */}
                    <div className="relative h-48 sm:h-72 flex-shrink-0">
                        <img src={movie.backdrop || movie.poster} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#0a0a1a]/40 to-transparent" />

                        <button onClick={onClose} className="absolute top-6 left-6 p-2.5 rounded-2xl bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all z-10">
                            <MdClose className="text-xl" />
                        </button>

                        <div className="absolute bottom-0 right-0 left-0 p-8 flex items-end gap-6">
                            <div className="w-24 h-36 sm:w-32 sm:h-48 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl flex-shrink-0 hidden sm:block">
                                <img src={movie.poster} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl sm:text-4xl font-black text-white font-arabic tracking-tight">{movie.titleAr || movie.title}</h2>
                                    {movie.featured && <MdStar className="text-yellow-400 text-2xl" />}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm font-semibold">
                                    <span className="text-yellow-400">{movie.year}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="flex items-center gap-1"><MdStar className="text-yellow-400" /> {movie.rating}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span>{movie.duration}</span>
                                    <div className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span className="px-2 py-0.5 rounded-lg bg-white/5 text-xs border border-white/10">{movie.quality}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-8 pt-6 hide-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Main Info */}
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <h4 className="text-gray-400 text-xs font-black font-arabic uppercase tracking-widest mb-3 opacity-50">قصة الفيلم</h4>
                                    <p className="text-gray-300 leading-relaxed font-arabic text-lg">{movie.overview || 'لا يوجد وصف متاح.'}</p>
                                </div>

                                {movie.cast?.length > 0 && (
                                    <div>
                                        <h4 className="text-gray-400 text-xs font-black font-arabic uppercase tracking-widest mb-4 opacity-50">طاقم العمل</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {movie.cast.slice(0, 6).map((actor, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/5">
                                                    <img src={actor.photo || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                    <div className="min-w-0">
                                                        <p className="text-white text-xs font-bold truncate">{actor.name}</p>
                                                        <p className="text-gray-500 text-[10px] truncate">{actor.character}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {movie.servers?.length > 0 && (
                                    <div>
                                        <h4 className="text-gray-400 text-xs font-black font-arabic uppercase tracking-widest mb-4 opacity-50">سيرفرات المشاهدة والتحميل</h4>
                                        <div className="space-y-3">
                                            {movie.servers.map((srv, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-yellow-400/5 border border-yellow-400/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                                                            <MdPlayCircle className="text-xl" />
                                                        </div>
                                                        <div>
                                                            <p className="text-white text-sm font-bold font-arabic">{srv.name}</p>
                                                            <p className="text-gray-500 text-xs">{srv.quality} • {srv.type}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {srv.watchLink && <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-[10px] font-bold">Watch</span>}
                                                        {srv.downloadLink && <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-bold">Download</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar Info */}
                            <div className="space-y-8">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
                                    <div>
                                        <h4 className="text-gray-500 text-[10px] font-black font-arabic uppercase tracking-tighter mb-2 opacity-50">التصنيف</h4>
                                        <p className="text-white font-bold font-arabic">{categoryLabel}</p>
                                    </div>
                                    {movie.subcategories?.length > 0 && (
                                        <div>
                                            <h4 className="text-gray-500 text-[10px] font-black font-arabic uppercase tracking-tighter mb-3 opacity-50">تصنيفات فرعية</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.subcategories.map(s => (
                                                    <span key={s} className="px-3 py-1 rounded-lg bg-white/5 text-gray-300 text-[10px] font-bold border border-white/10">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {movie.genres?.length > 0 && (
                                        <div>
                                            <h4 className="text-gray-500 text-[10px] font-black font-arabic uppercase tracking-tighter mb-3 opacity-50">الأنواع</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {movie.genres.map(g => (
                                                    <span key={g} className="px-3 py-1 rounded-lg bg-yellow-400/10 text-yellow-400 text-[10px] font-bold border border-yellow-400/20">{g}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {movie.parts?.length > 0 && (
                                        <div>
                                            <h4 className="text-gray-500 text-[10px] font-black font-arabic uppercase tracking-tighter mb-2 opacity-50">الأجزاء</h4>
                                            <p className="text-white font-bold font-arabic">{movie.parts.length + 1} أجزاء متوفرة</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// مكوّن إدارة أجزاء الفيلم
const PartsPanel = ({ movieId, parts, onUpdate }) => {
    const [newPartForm, setNewPartForm] = useState({ partNumber: '', name: '', poster: '', servers: [] });
    const [editingPart, setEditingPart] = useState(null);
    const [addingPart, setAddingPart] = useState(false);

    const handleAddPart = async () => {
        if (!newPartForm.partNumber) return;
        if (editingPart) {
            await updatePart(movieId, editingPart, newPartForm);
            setEditingPart(null);
        } else {
            await addPart(movieId, newPartForm);
        }
        setNewPartForm({ partNumber: '', name: '', poster: '', servers: [] });
        setAddingPart(false);
        onUpdate();
    };

    const handleEditPart = (part) => {
        setNewPartForm({ ...part });
        setEditingPart(part.id);
        setAddingPart(true);
    };

    const handleDeletePart = async (partId) => {
        if (!confirm('حذف هذا الجزء؟')) return;
        await deletePart(movieId, partId);
        onUpdate();
    };

    return (
        <div className="space-y-3 p-4 bg-yellow-400/5 rounded-2xl border border-yellow-400/10">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-yellow-400 text-sm font-arabic font-bold">أجزاء الفيلم / السلسلة</p>
                    <p className="text-gray-500 text-[10px] font-arabic">أضف الأجزاء الأخرى (مثل: الجزء الثاني، الثالث...)</p>
                </div>
                <button onClick={() => setAddingPart(!addingPart)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-400 text-black text-xs font-bold font-arabic shadow-lg shadow-yellow-400/20">
                    {addingPart ? <MdClose /> : <MdAdd />}
                    {addingPart ? 'إلغاء' : 'إضافة جزء'}
                </button>
            </div>

            {addingPart && (
                <div className="p-4 rounded-xl space-y-3 mb-4 bg-[#1a1a35] border border-white/10 shadow-2xl">
                    <div className="grid grid-cols-2 gap-3">
                        <input value={newPartForm.partNumber} onChange={e => setNewPartForm(p => ({ ...p, partNumber: e.target.value }))}
                            placeholder="رقم الجزء" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-arabic focus:outline-none focus:border-yellow-400/40" dir="rtl" />
                        <input value={newPartForm.name} onChange={e => setNewPartForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="اسم الجزء (مثال: الجزء الثاني)" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-arabic focus:outline-none focus:border-yellow-400/40" dir="rtl" />
                    </div>
                    <input value={newPartForm.poster} onChange={e => setNewPartForm(p => ({ ...p, poster: e.target.value }))}
                        placeholder="رابط بوستر الجزء (اختياري)" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-yellow-400/40" dir="rtl" />

                    {/* Servers for Part */}
                    <div className="border-t border-white/10 pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-xs font-arabic">سيرفرات مشاهدة هذا الجزء ({newPartForm.servers?.length || 0})</span>
                            <button onClick={() => setNewPartForm(p => ({ ...p, servers: [...(p.servers || []), { name: `سيرفر ${(p.servers?.length || 0) + 1}`, quality: 'FHD', type: 'embed', watchLink: '', downloadLink: '' }] }))}
                                className="text-yellow-400 text-xs font-bold flex items-center gap-1 hover:underline">
                                <MdAdd /> إضافة سيرفر
                            </button>
                        </div>
                        {newPartForm.servers?.map((srv, si) => (
                            <div key={si} className="p-3 mb-2 rounded-xl space-y-2 bg-black/20 border border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-yellow-400/60 text-[10px] uppercase font-bold">سيرفر {si + 1}</span>
                                    <button onClick={() => setNewPartForm(p => ({ ...p, servers: p.servers.filter((_, idx) => idx !== si) }))} className="text-red-400 hover:scale-110 transition"><MdDelete className="text-xs" /></button>
                                </div>
                                <input value={srv.watchLink} onChange={e => { const u = [...newPartForm.servers]; u[si].watchLink = e.target.value; setNewPartForm(p => ({ ...p, servers: u })); }}
                                    placeholder="رابط المشاهدة Direct/Embed" className="w-full bg-black/40 border border-white/10 rounded py-2 px-3 text-white text-[11px] focus:border-yellow-400/30 outline-none" dir="ltr" />
                            </div>
                        ))}
                    </div>

                    <button onClick={handleAddPart} className="w-full py-2.5 rounded-xl bg-yellow-400 text-black font-black text-sm font-arabic shadow-lg shadow-yellow-400/20 active:scale-95 transition-all">
                        {editingPart ? 'تعديل الجزء' : 'حفظ الجزء الجديد'}
                    </button>
                </div>
            )}

            <div className="space-y-2">
                {parts?.map(part => (
                    <div key={part.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-12 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 shadow-lg">
                                {part.poster ? <img src={part.poster} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/10"><MdImage /></div>}
                            </div>
                            <div>
                                <p className="text-white text-sm font-arabic font-bold">جزء {part.partNumber}{part.name && ` - ${part.name}`}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 text-[9px] font-bold">{part.servers?.length || 0} سيرفرات</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEditPart(part)} className="p-1.5 rounded-lg bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 transition"><MdEdit className="text-sm" /></button>
                            <button onClick={() => handleDeletePart(part.id)} className="p-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 transition"><MdDelete className="text-sm" /></button>
                        </div>
                    </div>
                ))}
                {(!parts || parts.length === 0) && !addingPart && (
                    <div className="text-center py-6 text-gray-500 font-arabic text-sm border-2 border-dashed border-white/5 rounded-xl">
                        لا توجد أجزاء إضافية لهذا الفيلم حالياً
                    </div>
                )}
            </div>
        </div>
    );
};

// الصفحة الرئيسية لإدارة الأفلام
const MoviesManager = () => {
    const [movies, setMovies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
    const [editMovie, setEditMovie] = useState(null);
    const [expandedMovie, setExpandedMovie] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [previewMovie, setPreviewMovie] = useState(null);

    const [folders, setFolders] = useState([]);
    const [activeFolder, setActiveFolder] = useState('all');
    const [folderModal, setFolderModal] = useState(false);
    const [editFolder, setEditFolder] = useState(null);
    const [folderForm, setFolderForm] = useState({ label: '', order: 1 });

    const load = async () => {
        setLoading(true);
        await initDefaultCategories();
        const [m, c, f] = await Promise.all([getMovies(), getCategories(), getMovieFolders()]);
        setMovies(m);
        setCategories(c);
        setFolders(f);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (form) => {
        // التحقق من التكرار
        const isDuplicate = movies.some(m => {
            if (editMovie && m.id === editMovie.id) return false;
            const sameTitleAr = form.titleAr && m.titleAr && form.titleAr.trim() === m.titleAr.trim();
            const sameTitleEn = form.titleEn && m.titleEn && form.titleEn.trim().toLowerCase() === m.titleEn.trim().toLowerCase();
            const sameOverview = form.overview && m.overview && form.overview.trim() === m.overview.trim();
            return sameTitleAr || sameTitleEn || sameOverview;
        });

        if (isDuplicate) {
            alert('خطأ: يوجد فيلم بنفس الاسم أو نفس القصة مسبقاً. يرجى التأكد من البيانات لمنع التكرار.');
            return;
        }

        if (editMovie) {
            await updateMovie(editMovie.id, form);
        } else {
            await addMovie(form);
        }
        await load();
    };

    const handleSaveFolder = async () => {
        if (!folderForm.label) return;
        if (editFolder) { await updateMovieFolder(editFolder.id, folderForm); }
        else { await addMovieFolder(folderForm); }
        setFolderModal(false); setEditFolder(null);
        setFolderForm({ label: '', order: 1 });
        await load();
    };

    const handleDeleteFolder = async (id) => {
        if (!confirm('حذف المجلد؟')) return;
        await deleteMovieFolder(id);
        await load();
    };

    const handleDelete = async (id) => {
        await deleteMovie(id);
        setDeleteConfirm(null);
        await load();
    };

    const [selectedItems, setSelectedItems] = useState([]);

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedItems(filtered.map(m => m.id));
        else setSelectedItems([]);
    };

    const handleCheckboxChange = (id) => {
        if (selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
        else setSelectedItems([...selectedItems, id]);
    };

    const handleBulkDelete = async () => {
        if (!confirm(`هل أنت متأكد من حذف ${selectedItems.length} فيلم؟`)) return;
        setLoading(true);
        for (const id of selectedItems) await deleteMovie(id);
        setSelectedItems([]);
        await load();
    };

    const handleExportJson = () => {
        const dataToExport = selectedItems.length > 0 ? movies.filter(m => selectedItems.includes(m.id)) : movies;
        const data = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `movies_backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    const handleImportJson = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!Array.isArray(data)) throw new Error('الملف يجب أن يحتوي على مصفوفة أفلام');
                if (!confirm(`سيتم استيراد ${data.length} فيلم، هل أنت متأكد؟`)) return;
                setLoading(true);
                let importedCount = 0;
                for (const movie of data) {
                    const { id, createdAt, updatedAt, ...movieData } = movie;
                    if (!movieData.title) continue;
                    // تحقق مبدئي لمنع التكرار التام
                    const exists = movies.some(m => m.title === movieData.title && m.year === movieData.year);
                    if (!exists) {
                        await addMovie(movieData);
                        importedCount++;
                    }
                }
                alert(`تم استيراد ${importedCount} فيلم بنجاح (تم تجاهل المتكرر).`);
                await load();
            } catch (err) {
                alert('خطأ في الاستيراد: ' + err.message);
                setLoading(false);
            }
        };
        reader.readAsText(file);
        e.target.value = null; // reset input
    };

    const filtered = movies.filter(m => {
        const matchesSearch = m.title?.toLowerCase().includes(search.toLowerCase()) ||
            m.titleAr?.includes(search) ||
            m.titleEn?.toLowerCase().includes(search.toLowerCase());

        const matchesFolder = activeFolder === 'all' ? true : m.folderId === activeFolder;

        return matchesSearch && matchesFolder;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white font-arabic">إدارة الأفلام</h1>
                    <p className="text-gray-400 text-sm font-arabic">{movies.length} فيلم محفوظ</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 justify-end">
                    {selectedItems.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-sm bg-red-500/20 hover:bg-red-500 transition-all border border-red-500/20"
                        >
                            <MdDelete className="text-lg" /> حذف {selectedItems.length}
                        </button>
                    )}
                    <input type="file" accept=".json" id="import_json" className="hidden" onChange={handleImportJson} />
                    <button
                        onClick={() => document.getElementById('import_json').click()}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-xs sm:text-sm bg-blue-500/20 hover:bg-blue-500/40 transition-all border border-blue-500/20"
                    >
                        ⬇️ استيراد
                    </button>
                    <button
                        onClick={handleExportJson}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl text-white font-bold text-xs sm:text-sm bg-emerald-500/20 hover:bg-emerald-500/40 transition-all border border-emerald-500/20"
                    >
                        ⬆️ تصدير
                    </button>
                    <button
                        onClick={() => setIsUrlModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm bg-white/10 hover:bg-white/20 transition-all border border-white/10"
                    >
                        <MdLink className="text-lg" /> استبدال الروابط
                    </button>
                    <button
                        onClick={() => { setEditMovie(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-black font-bold text-sm flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                    >
                        <MdAdd className="text-lg" /> إضافة فيلم
                    </button>
                </div>
            </div>

            {/* Folders Navigation */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
                <button
                    onClick={() => setActiveFolder('all')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-arabic font-bold transition-all border ${activeFolder === 'all'
                        ? 'bg-yellow-400 text-black border-transparent shadow-lg shadow-yellow-400/20'
                        : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                >
                    <MdFolder className="text-lg" /> الكل
                </button>

                {folders.map(folder => (
                    <div key={folder.id} className="relative group flex-shrink-0">
                        <button
                            onClick={() => setActiveFolder(folder.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-arabic font-bold transition-all border ${activeFolder === folder.id
                                ? 'bg-yellow-400 text-black border-transparent shadow-lg shadow-yellow-400/20'
                                : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                        >
                            <MdFolderOpen className="text-lg" /> {folder.label}
                        </button>
                        <div className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity z-10">
                            <button onClick={() => { setEditFolder(folder); setFolderForm(folder); setFolderModal(true); }}
                                className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"><MdEdit className="text-xs" /></button>
                            <button onClick={() => handleDeleteFolder(folder.id)}
                                className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"><MdDelete className="text-xs" /></button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => { setEditFolder(null); setFolderForm({ label: '', order: folders.length + 1 }); setFolderModal(true); }}
                    className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-dashed border-white/20 text-gray-500 flex items-center justify-center hover:text-white hover:border-yellow-400/50 transition-all"
                >
                    <MdAdd className="text-xl" />
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
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
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
                <div className="space-y-3">
                    {/* Select All Row */}
                    {filtered.length > 0 && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-2xl border border-white/10 mb-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); document.getElementById('selectAll').click() }}>
                            <input
                                id="selectAll"
                                type="checkbox"
                                className="w-5 h-5 accent-yellow-400 cursor-pointer"
                                checked={filtered.length > 0 && selectedItems.length === filtered.length}
                                onChange={handleSelectAll}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor="selectAll" className="text-white font-arabic text-sm cursor-pointer select-none">تحديد الكل ({filtered.length})</label>
                            <span className="text-gray-500 text-xs mr-auto">{selectedItems.length} محدد</span>
                        </div>
                    )}
                    {filtered.map((movie, i) => (
                        <motion.div
                            key={movie.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="rounded-2xl overflow-hidden"
                            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            {/* Movie Row */}
                            <div
                                onClick={() => setPreviewMovie(movie)}
                                className="flex items-center gap-4 p-4 hover:bg-white/[0.05] transition-colors cursor-pointer"
                                style={{ background: 'rgba(255,255,255,0.03)' }}
                            >
                                <div className="flex flex-col items-center justify-center pl-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-yellow-400 cursor-pointer"
                                        checked={selectedItems.includes(movie.id)}
                                        onChange={() => handleCheckboxChange(movie.id)}
                                    />
                                </div>
                                <div className="w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 shadow-2xl">
                                    <img
                                        src={movie.poster || 'https://via.placeholder.com/60x80?text=N/A'}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-white font-black font-arabic text-base truncate">{movie.titleAr || movie.title}</p>
                                        {movie.featured && <span className="p-1 rounded-full bg-yellow-400/20 text-yellow-400"><MdStar className="text-xs" /></span>}
                                    </div>
                                    <p className="text-gray-400 text-sm font-arabic truncate opacity-60">{movie.titleEn}</p>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                        <span className="text-gray-500 text-xs font-bold">{movie.year}</span>
                                        <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                            <MdStar className="text-yellow-400 text-[10px]" />
                                            <span className="text-yellow-400 text-xs font-bold">{movie.rating}</span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-gray-600" />
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-300 font-arabic border border-white/5">
                                                {movie.type === 'movie' ? 'فيلم' : 'جزء'}
                                            </span>
                                            <span className="text-gray-500 text-xs font-arabic">
                                                {movie.category ? categories.find(c => c.id === movie.category)?.label : 'بدون تصنيف'}
                                            </span>
                                        </div>
                                        {movie.parts?.length > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
                                                {movie.parts.length + 1} أجزاء
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setExpandedMovie(expandedMovie === movie.id ? null : movie.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-arabic font-bold transition-all border ${expandedMovie === movie.id ? 'bg-yellow-400 text-black border-transparent' : 'text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/10'}`}
                                    >
                                        {expandedMovie === movie.id ? <MdPlayCircle /> : <MdAdd />}
                                        {expandedMovie === movie.id ? 'إخفاء الأجزاء' : 'إدارة الأجزاء'}
                                    </button>
                                    <button
                                        onClick={() => { setEditMovie(movie); setModalOpen(true); }}
                                        className="p-2.5 rounded-xl text-white hover:bg-white/10 transition border border-white/10"
                                    >
                                        <MdEdit className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteConfirm(movie)}
                                        className="p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition border border-red-500/20"
                                    >
                                        <MdDelete className="text-lg" />
                                    </button>
                                </div>
                            </div>

                            {/* Parts Panel */}
                            <AnimatePresence>
                                {expandedMovie === movie.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-black/40"
                                    >
                                        <div className="p-5 border-t border-white/5">
                                            <PartsPanel movieId={movie.id} parts={movie.parts} onUpdate={load} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
                folders={folders}
            />

            {/* Folder Modal */}
            <AnimatePresence>
                {folderModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#1a1a35] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                            <h3 className="text-white font-black font-arabic text-lg mb-4">{editFolder ? 'تعديل المجلد' : 'إضافة مجلد جديد'}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-400 text-xs font-arabic mb-1 block">اسم المجلد</label>
                                    <input value={folderForm.label} onChange={e => setFolderForm(p => ({ ...p, label: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-arabic focus:outline-none focus:border-yellow-400/50" dir="rtl" />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs font-arabic mb-1 block">الترتيب</label>
                                    <input type="number" value={folderForm.order} onChange={e => setFolderForm(p => ({ ...p, order: parseInt(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-yellow-400/50" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button onClick={() => setFolderModal(false)} className="flex-1 py-3 bg-white/5 text-gray-400 font-arabic rounded-xl">إلغاء</button>
                                    <button onClick={handleSaveFolder} className="flex-1 py-3 bg-yellow-400 text-black font-black font-arabic rounded-xl shadow-lg shadow-yellow-400/20">حفظ</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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

            <MovieDetailsModal
                isOpen={!!previewMovie}
                onClose={() => setPreviewMovie(null)}
                movie={previewMovie}
                categories={categories}
            />

            <BulkUrlReplacerModal
                isOpen={isUrlModalOpen}
                onClose={() => { setIsUrlModalOpen(false); load(); }}
            />
        </div>
    );
};

export default MoviesManager;
