import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd, MdEdit, MdDelete, MdSearch, MdClose, MdStar,
    MdExpandMore, MdExpandLess, MdCheck, MdLink, MdImage, MdLiveTv,
    MdPlayCircle, MdDns, MdFolder, MdFolderOpen, MdSettings
} from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import {
    getSeries, addSeries, updateSeries, deleteSeries,
    addSeason, updateSeason, deleteSeason,
    addEpisode, updateEpisode, deleteEpisode
} from '../../firebase/seriesService';
import {
    getSeriesFolders, addSeriesFolder, updateSeriesFolder, deleteSeriesFolder
} from '../../firebase/seriesFoldersService';
import { getCategories } from '../../firebase/categoriesService';
import TMDBSearchModal from '../components/TMDBSearchModal';

const emptySeriesForm = {
    title: '', titleAr: '', titleEn: '', overview: '', poster: '', backdrop: '', logo: '',
    year: '', rating: '', quality: 'WEB-DL', introDuration: '', category: '', subcategory: '',
    folderId: '', cast: [], featured: false, isComingSoon: false, tmdbId: null, seasons: [], type: 'series',
};

// Helper to increment episode number in URL strings (handles leading zeros)
// Focused on numbers preceding an extension or at the end of the path
const incrementEpisodeUrl = (url) => {
    if (!url) return '';

    // Try to match a number before an extension (e.g., /01.mp4, /H-12.mkv)
    // This regex looks for digits followed by a dot and 2-4 alphanumeric characters at the end
    const extensionMatch = url.match(/(\d+)(?=\.[a-z0-9]{2,5}$)/i);
    if (extensionMatch) {
        const match = extensionMatch[1];
        const nextVal = parseInt(match, 10) + 1;
        const paddedNext = nextVal.toString().padStart(match.length, '0');
        // Replace ONLY the last occurrence of that specific digit group before the extension
        return url.replace(new RegExp(match + '(?=\\.[a-z0-9]{2,5}$)', 'i'), paddedNext);
    }

    // Fallback: If no extension-preceding number, try last block of digits at the very end
    return url.replace(/(\d+)(?=[^\d]*$)/, (match) => {
        const nextVal = parseInt(match, 10) + 1;
        return nextVal.toString().padStart(match.length, '0');
    });
};

// نموذج إضافة/تعديل مسلسل
const SeriesModal = ({ isOpen, onClose, onSave, editData, categories, folders }) => {
    const [form, setForm] = useState(editData || emptySeriesForm);
    const [tmdbOpen, setTmdbOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('basic');

    useEffect(() => {
        setForm(editData || emptySeriesForm);
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
            cast: data.cast,
            tmdbId: data.tmdbId,
            seasonsCount: data.seasonsCount,
        }));
    };

    const handleSave = async () => {
        if (!form.titleAr && !form.title) return alert('العنوان مطلوب');
        setSaving(true);
        await onSave(form);
        setSaving(false);
        onClose();
    };

    const selectedCat = categories.find(c => c.id === form.category);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
                    style={{ background: 'linear-gradient(135deg, #1a1a35, #12122a)', border: '1px solid rgba(0,212,255,0.2)', maxHeight: '90vh' }}
                >
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                                <MdLiveTv className="text-white text-lg" />
                            </div>
                            <h3 className="text-white font-black font-arabic text-lg">{editData ? 'تعديل المسلسل' : 'إضافة مسلسل جديد'}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setTmdbOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-arabic font-semibold text-white"
                                style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                                <MdSearch /> جلب من TMDB
                            </button>
                            <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition">
                                <MdClose className="text-xl" />
                            </button>
                        </div>
                    </div>

                    <div className="flex border-b border-white/10 flex-shrink-0">
                        {[{ id: 'basic', label: 'بيانات أساسية' }, { id: 'media', label: 'الصور' }, { id: 'cast', label: 'الممثلون' }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex-1 py-3 text-sm font-arabic font-semibold transition-all ${tab === t.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {tab === 'basic' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <SField label="العنوان بالعربي *" value={form.titleAr} onChange={v => { set('titleAr', v); set('title', v); }} placeholder="اسم المسلسل" />
                                    <SField label="العنوان الأجنبي" value={form.titleEn} onChange={v => set('titleEn', v)} placeholder="Series title" />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">القصة / الوصف</label>
                                    <textarea value={form.overview} onChange={e => set('overview', e.target.value)} rows={4}
                                        placeholder="قصة المسلسل..." dir="rtl"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400/60 transition font-arabic resize-none" />
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    <SField label="السنة" value={form.year} onChange={v => set('year', v)} placeholder="2024" />
                                    <SField label="التقييم" value={form.rating} onChange={v => set('rating', v)} placeholder="9.0" />
                                    <SField label="الجودة" value={form.quality} onChange={v => set('quality', v)} placeholder="WEB-DL" />
                                    <div className="flex flex-col gap-2">
                                        <label className="text-gray-300 text-sm font-arabic block">الحالة (Status)</label>
                                        <button onClick={() => set('isComingSoon', !form.isComingSoon)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${form.isComingSoon ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                                            <span className="text-xs font-arabic font-bold">قريباً (Coming Soon)</span>
                                            {form.isComingSoon ? <MdCheck /> : <div className="w-4 h-4 rounded-full border border-current" />}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">
                                            <span className="text-yellow-400 ml-1">⏭</span>مدة المقدمة (ثانية)
                                        </label>
                                        <input
                                            type="number"
                                            value={form.introDuration || ''}
                                            onChange={e => set('introDuration', e.target.value)}
                                            placeholder="مثال: 90"
                                            min="0"
                                            className="w-full bg-yellow-400/10 border border-yellow-400/30 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-yellow-400 transition"
                                            dir="ltr"
                                        />
                                        <p className="text-yellow-500/70 text-xs font-arabic mt-1">زر تخطي المقدمة</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">التصنيف</label>
                                        <select value={form.category} onChange={e => { set('category', e.target.value); set('subcategory', ''); }}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none">
                                            <option value="" className="bg-[#12122a]">اختر تصنيفاً</option>
                                            {categories.map(c => <option key={c.id} value={c.id} className="bg-[#12122a]">{c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">المجلد (Folder)</label>
                                        <select value={form.folderId} onChange={e => set('folderId', e.target.value)}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none">
                                            <option value="" className="bg-[#12122a]">بدون مجلد</option>
                                            {folders.map(f => <option key={f.id} value={f.id} className="bg-[#12122a]">{f.label}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {selectedCat?.subcategories?.length > 0 && (
                                    <div>
                                        <label className="text-gray-300 text-sm font-arabic mb-1 block">التصنيف الفرعي</label>
                                        <select value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
                                            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none">
                                            <option value="" className="bg-[#12122a]">اختر فرعياً</option>
                                            {selectedCat.subcategories.map(s => <option key={s.id} value={s.name} className="bg-[#12122a]">{s.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}
                        {tab === 'media' && (
                            <>
                                <SField label="رابط صورة البوستر" value={form.poster} onChange={v => set('poster', v)} placeholder="https://..." />
                                {form.poster && <img src={form.poster} alt="" className="w-24 h-36 object-cover rounded-xl" />}
                                <SField label="رابط صورة الخلفية" value={form.backdrop} onChange={v => set('backdrop', v)} placeholder="https://..." />
                                {form.backdrop && <img src={form.backdrop} alt="" className="w-full h-32 object-cover rounded-xl" />}
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
                            <div>
                                {form.cast?.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        {form.cast.map((a, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <img src={a.photo || 'https://via.placeholder.com/40'} alt={a.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-semibold truncate">{a.name}</p>
                                                    <p className="text-gray-400 text-xs truncate">{a.character}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 font-arabic">اجلب البيانات من TMDB لإضافة الممثلين</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 flex-shrink-0">
                        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition text-sm font-arabic">إلغاء</button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                            <MdCheck /> {saving ? 'جارٍ الحفظ...' : (editData ? 'حفظ التعديلات' : 'إضافة المسلسل')}
                        </button>
                    </div>
                </motion.div>

                <TMDBSearchModal isOpen={tmdbOpen} onClose={() => setTmdbOpen(false)} onSelect={handleTMDBSelect} type="tv" />
            </motion.div>
        </AnimatePresence>
    );
};

const SField = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="text-gray-300 text-sm font-arabic mb-1 block">{label}</label>
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400/60 transition font-arabic" dir="rtl" />
    </div>
);

// إدارة المواسم والحلقات
const SeasonsPanel = ({ seriesId, seasons, onUpdate }) => {
    const EP_QUALITIES = ['FHD', 'HD', 'WEB-DL', '4K', '720p', '1080p'];
    const EP_SERVER_TYPES = ['embed', 'direct', 'iframe', 'hls', 'mp4', 'other'];
    const emptyEpServer = { name: '', quality: 'FHD', type: 'embed', watchLink: '', downloadLink: '' };
    const [expanded, setExpanded] = useState(null);
    const [newSeasonForm, setNewSeasonForm] = useState({ seasonNumber: '', name: '', poster: '' });
    const [addingEp, setAddingEp] = useState(null);
    const [editingEp, setEditingEp] = useState(null);
    const [epForm, setEpForm] = useState({ episodeNumber: '', name: '', overview: '', servers: [], still: '', introDuration: '' });

    const handleAddSeason = async () => {
        if (!newSeasonForm.seasonNumber) return;
        await addSeason(seriesId, newSeasonForm);
        setNewSeasonForm({ seasonNumber: '', name: '', poster: '' });
        onUpdate();
    };

    const handleDeleteSeason = async (seasonId) => {
        if (!confirm('حذف هذا الموسم وجميع حلقاته؟')) return;
        await deleteSeason(seriesId, seasonId);
        onUpdate();
    };

    const handleAddEpisode = async (seasonId) => {
        if (!epForm.episodeNumber) return;
        if (editingEp) {
            await updateEpisode(seriesId, seasonId, editingEp, epForm);
        } else {
            await addEpisode(seriesId, seasonId, epForm);
        }
        setEpForm({ episodeNumber: '', name: '', overview: '', servers: [], still: '', introDuration: '' });
        setAddingEp(null);
        setEditingEp(null);
        onUpdate();
    };

    const handleEditEpisode = (seasonId, ep) => {
        setEpForm({ ...ep });
        setEditingEp(ep.id);
        setAddingEp(seasonId);
    };

    const handleDeleteEpisode = async (seasonId, epId) => {
        await deleteEpisode(seriesId, seasonId, epId);
        onUpdate();
    };

    // Moved to top-level scope

    const handleAutoGenerateEpisode = async (season) => {
        if (!season.episodes || season.episodes.length === 0) return;

        // Find the episode with the highest number
        const sortedEps = [...season.episodes].sort((a, b) =>
            parseInt(a.episodeNumber, 10) - parseInt(b.episodeNumber, 10)
        );
        const lastEp = sortedEps[sortedEps.length - 1];

        const nextNum = parseInt(lastEp.episodeNumber, 10) + 1;

        // Create generated form
        const autoForm = {
            episodeNumber: nextNum.toString(),
            name: `الحلقة ${nextNum}`,
            overview: lastEp.overview || '',
            still: lastEp.still || '',
            introDuration: lastEp.introDuration || '',
            servers: (lastEp.servers || []).map(srv => ({
                ...srv,
                watchLink: incrementEpisodeUrl(srv.watchLink),
                downloadLink: incrementEpisodeUrl(srv.downloadLink)
            }))
        };

        await addEpisode(seriesId, season.id, autoForm);
        onUpdate();
    };

    return (
        <div className="space-y-3">
            {/* إضافة موسم */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                <p className="text-cyan-400 text-sm font-arabic font-bold mb-3">إضافة موسم جديد</p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                    <input value={newSeasonForm.seasonNumber} onChange={e => setNewSeasonForm(p => ({ ...p, seasonNumber: e.target.value }))}
                        placeholder="رقم الموسم" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-arabic focus:outline-none" dir="rtl" />
                    <input value={newSeasonForm.name} onChange={e => setNewSeasonForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="اسم الموسم" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-arabic focus:outline-none" dir="rtl" />
                    <input value={newSeasonForm.poster} onChange={e => setNewSeasonForm(p => ({ ...p, poster: e.target.value }))}
                        placeholder="رابط الصورة" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none" dir="rtl" />
                </div>
                <button onClick={handleAddSeason}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-arabic font-semibold"
                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                    <MdAdd /> إضافة موسم
                </button>
            </div>

            {/* قائمة المواسم */}
            {seasons?.map(season => (
                <div key={season.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.04)' }}
                        onClick={() => setExpanded(expanded === season.id ? null : season.id)}
                    >
                        <div className="flex items-center gap-3">
                            {expanded === season.id ? <MdExpandLess className="text-cyan-400" /> : <MdExpandMore className="text-gray-400" />}
                            <span className="text-white font-arabic font-semibold text-sm">
                                الموسم {season.seasonNumber} {season.name && `- ${season.name}`}
                            </span>
                            <span className="text-xs text-gray-400">({season.episodes?.length || 0} حلقة)</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSeason(season.id); }}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">
                            <MdDelete className="text-sm" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {expanded === season.id && (
                            <motion.div
                                initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 space-y-2">
                                    {/* الحلقات */}
                                    {season.episodes?.map(ep => (
                                        <div key={ep.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                            <div className="flex items-center gap-3">
                                                <span className="text-cyan-400 text-xs font-bold w-8">E{ep.episodeNumber}</span>
                                                <span className="text-white text-sm font-arabic">{ep.name || `الحلقة ${ep.episodeNumber}`}</span>
                                                {ep.watchLink && <span className="text-green-400 text-xs">✓ رابط</span>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleEditEpisode(season.id, ep)}
                                                    className="p-1 rounded bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 transition">
                                                    <MdEdit className="text-xs" />
                                                </button>
                                                <button onClick={() => handleDeleteEpisode(season.id, ep.id)}
                                                    className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">
                                                    <MdDelete className="text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* إضافة حلقة */}
                                    {addingEp === season.id ? (
                                        <div className="p-3 rounded-xl space-y-3" style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                                            <p className="text-cyan-400 text-xs font-bold font-arabic">{editingEp ? 'تعديل الحلقة' : 'إضافة حلقة جديدة'}</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input value={epForm.episodeNumber} onChange={e => setEpForm(p => ({ ...p, episodeNumber: e.target.value }))}
                                                    placeholder="رقم الحلقة" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-arabic focus:outline-none" dir="rtl" />
                                                <input value={epForm.name} onChange={e => setEpForm(p => ({ ...p, name: e.target.value }))}
                                                    placeholder="اسم الحلقة" className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm font-arabic focus:outline-none" dir="rtl" />
                                            </div>
                                            <input value={epForm.still} onChange={e => setEpForm(p => ({ ...p, still: e.target.value }))}
                                                placeholder="رابط الصورة المصغرة (اختياري)" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none" dir="rtl" />
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={epForm.introDuration || ''}
                                                    onChange={e => setEpForm(p => ({ ...p, introDuration: e.target.value }))}
                                                    placeholder="مدة المقدمة بالثانية (مثال: 90)"
                                                    min="0"
                                                    className="flex-1 bg-yellow-400/10 border border-yellow-400/30 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition"
                                                    dir="ltr"
                                                />
                                                <span className="text-yellow-400 text-xs font-arabic whitespace-nowrap">⏭ تخطي مقدمة</span>
                                            </div>

                                            {/* سيرفرات الحلقة */}
                                            <div className="border-t border-white/10 pt-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-yellow-400 text-xs font-bold font-arabic">سيرفرات المشاهدة ({epForm.servers?.length || 0})</p>
                                                    <button
                                                        onClick={() => setEpForm(p => ({ ...p, servers: [...(p.servers || []), { ...emptyEpServer, name: `سيرفر ${(p.servers?.length || 0) + 1}` }] }))}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-black text-xs font-bold"
                                                        style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                                                    >
                                                        <MdAdd /> إضافة سيرفر
                                                    </button>
                                                </div>
                                                {(epForm.servers || []).map((srv, si) => (
                                                    <div key={si} className="p-3 mb-2 rounded-xl space-y-2" style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.12)' }}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-yellow-400 text-xs font-bold font-arabic">سيرفر {si + 1}</span>
                                                            <button onClick={() => setEpForm(p => ({ ...p, servers: p.servers.filter((_, idx) => idx !== si) }))}
                                                                className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">
                                                                <MdDelete className="text-xs" />
                                                            </button>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input value={srv.name} onChange={e => { const u = [...epForm.servers]; u[si] = { ...u[si], name: e.target.value }; setEpForm(p => ({ ...p, servers: u })); }}
                                                                placeholder="الاسم" className="bg-white/5 border border-white/10 rounded-lg py-2 px-2 text-white text-xs font-arabic focus:outline-none" dir="rtl" />
                                                            <select value={srv.quality} onChange={e => { const u = [...epForm.servers]; u[si] = { ...u[si], quality: e.target.value }; setEpForm(p => ({ ...p, servers: u })); }}
                                                                className="bg-white/5 border border-white/10 rounded-lg py-2 px-2 text-white text-xs focus:outline-none">
                                                                {EP_QUALITIES.map(q => <option key={q} value={q} className="bg-[#12122a]">{q}</option>)}
                                                            </select>
                                                            <select value={srv.type} onChange={e => { const u = [...epForm.servers]; u[si] = { ...u[si], type: e.target.value }; setEpForm(p => ({ ...p, servers: u })); }}
                                                                className="bg-white/5 border border-white/10 rounded-lg py-2 px-2 text-white text-xs focus:outline-none">
                                                                {EP_SERVER_TYPES.map(t => <option key={t} value={t} className="bg-[#12122a]">{t}</option>)}
                                                            </select>
                                                        </div>
                                                        <input value={srv.watchLink} onChange={e => { const u = [...epForm.servers]; u[si] = { ...u[si], watchLink: e.target.value }; setEpForm(p => ({ ...p, servers: u })); }}
                                                            placeholder="رابط المشاهدة" dir="ltr" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-green-400/40" />
                                                        <input value={srv.downloadLink} onChange={e => { const u = [...epForm.servers]; u[si] = { ...u[si], downloadLink: e.target.value }; setEpForm(p => ({ ...p, servers: u })); }}
                                                            placeholder="رابط التحميل" dir="ltr" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-xs focus:outline-none focus:border-blue-400/40" />
                                                    </div>
                                                ))}
                                                {(!epForm.servers || epForm.servers.length === 0) && (
                                                    <p className="text-gray-600 text-xs font-arabic text-center py-2">لم تُضف سيرفرات بعد</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2 pt-1">
                                                <button onClick={() => handleAddEpisode(season.id)}
                                                    className="flex-1 py-2 rounded-lg text-white text-sm font-arabic font-semibold"
                                                    style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                                                    {editingEp ? 'حفظ التعديلات' : 'حفظ الحلقة'}
                                                </button>
                                                <button onClick={() => { setAddingEp(null); setEditingEp(null); setEpForm({ episodeNumber: '', name: '', overview: '', servers: [], still: '', introDuration: '' }); }}
                                                    className="px-4 py-2 rounded-lg bg-white/10 text-gray-400 text-sm font-arabic">
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setAddingEp(season.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-cyan-400/40 transition text-sm font-arabic">
                                                <MdAdd /> إضافة حلقة
                                            </button>

                                            {season.episodes?.length > 0 && (
                                                <button
                                                    onClick={() => handleAutoGenerateEpisode(season)}
                                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-400 text-black font-bold text-xs font-arabic shadow-lg shadow-yellow-400/20 hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    <MdPlayCircle className="text-lg" />
                                                    إنشاء حلقة تلقائية
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
};

// الصفحة الرئيسية لإدارة المسلسلات
const SeriesManager = () => {
    const [seriesList, setSeriesList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editSeries, setEditSeries] = useState(null);
    const [expandedSeries, setExpandedSeries] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Folders
    const [folders, setFolders] = useState([]);
    const [activeFolder, setActiveFolder] = useState('all');
    const [folderModal, setFolderModal] = useState(false);
    const [editFolder, setEditFolder] = useState(null);
    const [folderForm, setFolderForm] = useState({ label: '', order: 1 });

    const load = async () => {
        setLoading(true);
        const [s, c, f] = await Promise.all([getSeries(), getCategories(), getSeriesFolders()]);
        setSeriesList(s);
        setCategories(c);
        setFolders(f);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSave = async (form) => {
        if (editSeries) { await updateSeries(editSeries.id, form); }
        else { await addSeries(form); }
        await load();
    };

    const handleDelete = async (id) => {
        await deleteSeries(id);
        setDeleteConfirm(null);
        await load();
    };

    const handleSaveFolder = async () => {
        if (!folderForm.label) return;
        if (editFolder) { await updateSeriesFolder(editFolder.id, folderForm); }
        else { await addSeriesFolder(folderForm); }
        setFolderModal(false); setEditFolder(null);
        setFolderForm({ label: '', order: 1 });
        await load();
    };

    const handleDeleteFolder = async (id) => {
        if (!confirm('حذف المجلد؟ لن يتم حذف المسلسلات بداخلها.')) return;
        await deleteSeriesFolder(id);
        await load();
    };

    const filtered = seriesList.filter(s => {
        const matchesSearch = s.title?.toLowerCase().includes(search.toLowerCase()) || s.titleAr?.includes(search);
        const matchesFolder = activeFolder === 'all'
            ? true
            : (activeFolder === 'none' ? !s.folderId : s.folderId === activeFolder);
        return matchesSearch && matchesFolder;
    });

    const handleBulkAutoGenerate = async () => {
        const TARGET_CAT = "مسلسلات رمضان 2026";
        const targets = seriesList.filter(s => s.subcategory === TARGET_CAT);

        if (targets.length === 0) return alert(`لا توجد مسلسلات تحت تصنيف "${TARGET_CAT}"`);
        if (!confirm(`هل أنت متأكد من توليد حلقة جديدة لـ ${targets.length} مسلسل من "${TARGET_CAT}"؟`)) return;

        setLoading(true);
        let count = 0;

        try {
            for (const series of targets) {
                if (!series.seasons || series.seasons.length === 0) continue;

                // Sort seasons to find the latest
                const sortedSeasons = [...series.seasons].sort((a, b) =>
                    parseInt(a.seasonNumber, 10) - parseInt(b.seasonNumber, 10)
                );
                const season = sortedSeasons[sortedSeasons.length - 1];

                if (!season.episodes || season.episodes.length === 0) continue;

                // Find latest episode
                const sortedEps = [...season.episodes].sort((a, b) =>
                    parseInt(a.episodeNumber, 10) - parseInt(b.episodeNumber, 10)
                );
                const lastEp = sortedEps[sortedEps.length - 1];
                const nextNum = parseInt(lastEp.episodeNumber, 10) + 1;

                const autoForm = {
                    episodeNumber: nextNum.toString(),
                    name: `الحلقة ${nextNum}`,
                    overview: lastEp.overview || '',
                    still: lastEp.still || '',
                    introDuration: lastEp.introDuration || '',
                    servers: (lastEp.servers || []).map(srv => ({
                        ...srv,
                        watchLink: incrementEpisodeUrl(srv.watchLink),
                        downloadLink: incrementEpisodeUrl(srv.downloadLink)
                    }))
                };

                await addEpisode(series.id, season.id, autoForm);
                count++;
            }
            alert(`تم بنجاح توليد ${count} حلقة لجميع مسلسلات رمضان 2026`);
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء التوليد التلقائي');
        }

        await load();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white font-arabic">إدارة المسلسلات</h1>
                    <p className="text-gray-400 text-sm font-arabic">{seriesList.length} مسلسل محفوظ</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleBulkAutoGenerate}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-400 text-black border border-yellow-500 hover:scale-[1.02] active:scale-95 transition-all font-black text-sm shadow-lg shadow-yellow-400/20">
                        <MdPlayCircle className="text-xl" /> توليد حلقات رمضان 2026
                    </button>
                    <button onClick={() => setFolderModal(true)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 transition font-bold text-sm">
                        <MdSettings className="text-lg" /> إدارة المجلدات
                    </button>
                    <button onClick={() => { setEditSeries(null); setModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                        <MdAdd className="text-lg" /> إضافة مسلسل
                    </button>
                </div>
            </div>

            {/* Folder Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setActiveFolder('all')}
                    className={`px-6 py-2 rounded-xl font-arabic text-sm font-bold transition-all border ${activeFolder === 'all' ? 'bg-cyan-500 text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                    الكل
                </button>
                <button onClick={() => setActiveFolder('none')}
                    className={`px-6 py-2 rounded-xl font-arabic text-sm font-bold transition-all border ${activeFolder === 'none' ? 'bg-cyan-500 text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                    بدون مجلد
                </button>
                {folders.map(f => (
                    <button key={f.id} onClick={() => setActiveFolder(f.id)}
                        className={`px-6 py-2 rounded-xl font-arabic text-sm font-bold transition-all border ${activeFolder === f.id ? 'bg-cyan-500 text-white border-transparent' : 'bg-white/5 text-gray-400 border-white/5'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            <div className="relative">
                <MdSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المسلسلات..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-cyan-400/50 transition font-arabic" dir="rtl" />
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <MdLiveTv className="text-8xl text-gray-700 mb-4" />
                    <h3 className="text-xl font-black text-gray-400 mb-2 font-arabic">لا توجد مسلسلات</h3>
                    <button onClick={() => { setEditSeries(null); setModalOpen(true); }}
                        className="mt-4 px-6 py-3 rounded-xl text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                        إضافة مسلسل الآن
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((series, i) => (
                        <motion.div key={series.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                            {/* Series Row */}
                            <div className="flex items-center gap-4 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <img src={series.poster || 'https://via.placeholder.com/60x80?text=N/A'} alt=""
                                    className="w-14 h-20 object-cover rounded-xl flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-black font-arabic text-base">{series.titleAr || series.title}</p>
                                    <p className="text-gray-400 text-sm font-arabic">{series.titleEn}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-gray-500 text-xs">{series.year}</span>
                                        <div className="flex items-center gap-1">
                                            <MdStar className="text-yellow-400 text-xs" />
                                            <span className="text-yellow-400 text-xs">{series.rating}</span>
                                        </div>
                                        <span className="text-cyan-400 text-xs">{series.seasons?.length || 0} مواسم</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button onClick={() => setExpandedSeries(expandedSeries === series.id ? null : series.id)}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-arabic font-semibold text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/10 transition">
                                        {expandedSeries === series.id ? <MdExpandLess /> : <MdExpandMore />}
                                        {expandedSeries === series.id ? 'إغلاق' : 'المواسم'}
                                    </button>
                                    <button onClick={() => { setEditSeries(series); setModalOpen(true); }}
                                        className="p-2 rounded-xl text-yellow-400 hover:bg-yellow-400/10 transition border border-yellow-400/20">
                                        <MdEdit />
                                    </button>
                                    <button onClick={() => setDeleteConfirm(series)}
                                        className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 transition border border-red-400/20">
                                        <MdDelete />
                                    </button>
                                </div>
                            </div>
                            {/* Seasons Panel */}
                            <AnimatePresence>
                                {expandedSeries === series.id && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="p-4 border-t border-white/5">
                                            <SeasonsPanel seriesId={series.id} seasons={series.seasons} onUpdate={load} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            <SeriesModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editData={editSeries} categories={categories} folders={folders} />

            {/* مودال إدارة المجلدات */}
            <AnimatePresence>
                {folderModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-lg rounded-2xl overflow-hidden"
                            style={{ background: '#1a1a35', border: '1px solid rgba(0,212,255,0.2)' }}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <h3 className="text-white font-black font-arabic">إدارة المجلدات</h3>
                                <button onClick={() => { setFolderModal(false); setEditFolder(null); }} className="text-gray-400 hover:text-white"><MdClose /></button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <input value={folderForm.label} onChange={e => setFolderForm(p => ({ ...p, label: e.target.value }))}
                                        placeholder="اسم المجلد الجديد..." dir="rtl"
                                        className="flex-1 bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-cyan-400/60 transition font-arabic" />
                                    <button onClick={handleSaveFolder}
                                        className="px-6 py-3 rounded-xl text-white font-bold font-arabic transition-all"
                                        style={{ background: 'linear-gradient(135deg, #00d4ff, #0080ff)' }}>
                                        {editFolder ? 'حفظ' : 'إضافة'}
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                                    {folders.map(f => (
                                        <div key={f.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <MdFolder className="text-cyan-400 text-xl" />
                                                <span className="text-white font-arabic">{f.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => { setEditFolder(f); setFolderForm({ label: f.label, order: f.order }); }}
                                                    className="p-1.5 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition">
                                                    <MdEdit className="text-sm" />
                                                </button>
                                                <button onClick={() => handleDeleteFolder(f.id)}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition">
                                                    <MdDelete className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {folders.length === 0 && <p className="text-center py-4 text-gray-500 font-arabic">لا توجد مجلدات حالياً</p>}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-2xl p-6 max-w-sm w-full text-center"
                            style={{ background: '#1a1a35', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <MdDelete className="text-5xl text-red-400 mx-auto mb-3" />
                            <h3 className="text-white font-black font-arabic text-lg mb-2">حذف المسلسل؟</h3>
                            <p className="text-gray-400 text-sm font-arabic mb-5">هل أنت متأكد من حذف "{deleteConfirm.titleAr}"؟ سيتم حذف جميع المواسم والحلقات.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black font-arabic">حذف</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeriesManager;
