import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdStar,
    MdMovieFilter, MdCheck, MdImage, MdLink, MdPlayCircle, MdDns
} from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import { getMovies, addMovie, updateMovie, deleteMovie, addPart, updatePart, deletePart } from '../../firebase/moviesService';
import { getCategories } from '../../firebase/categoriesService';
import TMDBSearchModal from '../components/TMDBSearchModal';

const QUALITIES = ['WEB-DL', 'BluRay', 'HDRip', '4K', 'CAM', 'HD', 'FHD', 'SCR', '720p', '1080p'];
const SERVER_TYPES = ['embed', 'direct', 'iframe', 'hls', 'mp4', 'other'];

const emptyServer = { name: '', quality: 'FHD', type: 'embed', watchLink: '', downloadLink: '' };

const emptyMovieForm = {
    title: '', titleAr: '', titleEn: '', overview: '', poster: '', backdrop: '', logo: '',
    year: '', rating: '', duration: '', introDuration: '', quality: 'WEB-DL', category: '',
    subcategory: '', genres: [], cast: [], servers: [], parts: [],
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
    const [editMovie, setEditMovie] = useState(null);
    const [expandedMovie, setExpandedMovie] = useState(null);
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
                            <div className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors" style={{ background: 'rgba(255,255,255,0.03)' }}>
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
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-gray-500 text-xs font-bold">{movie.year}</span>
                                        <div className="flex items-center gap-1 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                            <MdStar className="text-yellow-400 text-[10px]" />
                                            <span className="text-yellow-400 text-xs font-bold">{movie.rating}</span>
                                        </div>
                                        <div className="h-1 w-1 rounded-full bg-gray-600" />
                                        <span className="text-gray-500 text-xs">{movie.category ? categories.find(c => c.id === movie.category)?.label : 'بدون تصنيف'}</span>
                                        {movie.parts?.length > 0 && (
                                            <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black text-[10px] font-black uppercase tracking-wider">
                                                {movie.parts.length + 1} أجزاء
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
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
