import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdAdd, MdEdit, MdDelete, MdClose, MdCheck, MdViewCarousel,
    MdDragHandle, MdMovie, MdLiveTv, MdVisibility, MdVisibilityOff
} from 'react-icons/md';
import {
    getSections, addSection, updateSection, deleteSection,
    addItemToSection, removeItemFromSection, initDefaultSections
} from '../../firebase/sectionsService';
import { getMovies } from '../../firebase/moviesService';
import { getSeries } from '../../firebase/seriesService';

const TYPES = [
    { value: 'mixed', label: 'أفلام ومسلسلات' },
    { value: 'movies', label: 'أفلام فقط' },
    { value: 'series', label: 'مسلسلات فقط' },
];

const SectionsManager = () => {
    const [sections, setSections] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    // نماذج
    const [secModal, setSecModal] = useState(false);
    const [editSec, setEditSec] = useState(null);
    const [secForm, setSecForm] = useState({ title: '', titleEn: '', type: 'mixed', order: 1 });
    const [addItemModal, setAddItemModal] = useState(null);
    const [itemSearch, setItemSearch] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const load = async () => {
        setLoading(true);
        await initDefaultSections();
        const [s, m, sr] = await Promise.all([getSections(), getMovies(), getSeries()]);
        setSections(s); setMovies(m); setSeries(sr);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSaveSec = async () => {
        if (!secForm.title) return alert('العنوان مطلوب');
        if (editSec) { await updateSection(editSec.id, secForm); }
        else { await addSection(secForm); }
        setSecModal(false); setEditSec(null);
        setSecForm({ title: '', titleEn: '', type: 'mixed', order: 1 });
        await load();
    };

    const handleDeleteSec = async (id) => {
        await deleteSection(id); setDeleteConfirm(null); await load();
    };

    const handleToggleVisibility = async (section) => {
        const newState = section.isActive === false ? true : false;
        await updateSection(section.id, { isActive: newState });
        await load();
    };

    const handleAddItem = async (sectionId, item) => {
        const section = sections.find(s => s.id === sectionId);
        const alreadyAdded = section?.items?.find(i => i.id === item.id);
        if (alreadyAdded) return;
        await addItemToSection(sectionId, { id: item.id, title: item.titleAr || item.title, poster: item.poster, type: item.type });
        await load();
    };

    const handleRemoveItem = async (sectionId, itemId) => {
        await removeItemFromSection(sectionId, itemId); await load();
    };

    const getItemsForModal = (section) => {
        let items = [];
        if (section.type === 'movies' || section.type === 'mixed') {
            items = [...items, ...movies.map(m => ({ ...m, type: 'movie' }))];
        }
        if (section.type === 'series' || section.type === 'mixed') {
            items = [...items, ...series.map(s => ({ ...s, type: 'series' }))];
        }
        return items.filter(i =>
            (i.titleAr || i.title)?.toLowerCase().includes(itemSearch.toLowerCase()) ||
            i.titleEn?.toLowerCase().includes(itemSearch.toLowerCase())
        );
    };

    const typeColors = { mixed: '#ffd700', movies: '#f97316', series: '#00d4ff' };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white font-arabic">إدارة أقسام الرئيسية</h1>
                    <p className="text-gray-400 text-sm font-arabic">{sections.length} أقسام</p>
                </div>
                <button onClick={() => { setEditSec(null); setSecForm({ title: '', titleEn: '', type: 'mixed', order: sections.length + 1 }); setSecModal(true); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-black font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    <MdAdd /> إضافة قسم
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
                <div className="space-y-4">
                    {sections.map((section, idx) => {
                        const color = typeColors[section.type] || '#22c55e';
                        return (
                            <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                                className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}25` }}>
                                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                                    style={{ background: `linear-gradient(135deg, ${color}08, rgba(255,255,255,0.02))` }}
                                    onClick={() => setExpanded(expanded === section.id ? null : section.id)}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                                        <MdViewCarousel className="text-white text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-black font-arabic">{section.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-xs px-2 py-0.5 rounded-lg font-arabic" style={{ background: `${color}20`, color }}>
                                                {TYPES.find(t => t.value === section.type)?.label}
                                            </span>
                                            <span className="text-gray-500 text-xs">{section.items?.length || 0} عنصر</span>
                                            <span className="text-gray-600 text-xs">ترتيب: {section.order}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setAddItemModal(section); setItemSearch(''); }}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-arabic text-white font-semibold"
                                            style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                                            <MdAdd /> إضافة
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleToggleVisibility(section); }}
                                            title={section.isActive === false ? "إظهار في الرئيسية" : "إخفاء من الرئيسية"}
                                            className={`p-2 rounded-xl border transition ${section.isActive === false
                                                ? 'text-gray-500 border-gray-500/20 hover:bg-gray-500/10'
                                                : 'text-green-400 border-green-400/20 hover:bg-green-400/10'
                                                }`}>
                                            {section.isActive === false ? <MdVisibilityOff className="text-sm" /> : <MdVisibility className="text-sm" />}
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setEditSec(section); setSecForm({ title: section.title, titleEn: section.titleEn, type: section.type, order: section.order }); setSecModal(true); }}
                                            className="p-2 rounded-xl text-yellow-400 hover:bg-yellow-400/10 border border-yellow-400/20 transition">
                                            <MdEdit className="text-sm" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(section); }}
                                            className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 border border-red-400/20 transition">
                                            <MdDelete className="text-sm" />
                                        </button>
                                    </div>
                                </div>

                                {/* عناصر القسم */}
                                <AnimatePresence>
                                    {expanded === section.id && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="px-5 py-4 border-t" style={{ borderColor: `${color}15` }}>
                                                {section.items?.length === 0 ? (
                                                    <p className="text-gray-500 text-sm font-arabic text-center py-4">لا توجد عناصر، أضف أفلام أو مسلسلات</p>
                                                ) : (
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                                        {section.items?.map(item => (
                                                            <div key={item.id} className="relative group">
                                                                <img src={item.poster || 'https://via.placeholder.com/80x120'} alt={item.title}
                                                                    className="w-full aspect-[2/3] object-cover rounded-lg" />
                                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-lg">
                                                                    <button onClick={() => handleRemoveItem(section.id, item.id)}
                                                                        className="p-1.5 rounded-full bg-red-500 text-white">
                                                                        <MdClose className="text-xs" />
                                                                    </button>
                                                                </div>
                                                                <p className="text-white text-xs font-arabic mt-1 truncate">{item.title}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* مودال إضافة/تعديل قسم */}
            <AnimatePresence>
                {secModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-md rounded-2xl p-6"
                            style={{ background: '#1a1a35', border: '1px solid rgba(34,197,94,0.3)' }}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-white font-black font-arabic text-lg">{editSec ? 'تعديل القسم' : 'إضافة قسم'}</h3>
                                <button onClick={() => setSecModal(false)} className="text-gray-400 hover:text-white"><MdClose /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">العنوان بالعربي *</label>
                                    <input value={secForm.title} onChange={e => setSecForm(p => ({ ...p, title: e.target.value }))}
                                        placeholder="مثال: مضاف حديثاً" dir="rtl"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-green-400/60 transition font-arabic" />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">العنوان بالإنجليزي</label>
                                    <input value={secForm.titleEn} onChange={e => setSecForm(p => ({ ...p, titleEn: e.target.value }))}
                                        placeholder="e.g. Recently Added"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-green-400/60 transition" />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">نوع المحتوى</label>
                                    <select value={secForm.type} onChange={e => setSecForm(p => ({ ...p, type: e.target.value }))}
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none">
                                        {TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#12122a]">{t.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">الترتيب</label>
                                    <input type="number" value={secForm.order} onChange={e => setSecForm(p => ({ ...p, order: parseInt(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setSecModal(false)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={handleSaveSec}
                                    className="flex-1 py-3 rounded-xl text-white font-black font-arabic flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                                    <MdCheck /> {editSec ? 'حفظ' : 'إضافة'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* مودال إضافة عنصر للقسم */}
            <AnimatePresence>
                {addItemModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-xl rounded-2xl overflow-hidden"
                            style={{ background: '#1a1a35', border: '1px solid rgba(34,197,94,0.2)', maxHeight: '80vh' }}>
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <h3 className="text-white font-black font-arabic">إضافة عنصر لقسم "{addItemModal.title}"</h3>
                                <button onClick={() => setAddItemModal(null)} className="text-gray-400 hover:text-white"><MdClose /></button>
                            </div>
                            <div className="p-4 border-b border-white/10">
                                <input value={itemSearch} onChange={e => setItemSearch(e.target.value)}
                                    placeholder="بحث..." dir="rtl"
                                    className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none font-arabic" />
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                                {getItemsForModal(addItemModal).map(item => {
                                    const added = addItemModal.items?.find(i => i.id === item.id);
                                    return (
                                        <button key={`${item.type}-${item.id}`}
                                            onClick={() => handleAddItem(addItemModal.id, item)}
                                            disabled={!!added}
                                            className={`w-full flex items-center gap-3 px-5 py-3 border-b border-white/5 text-right transition-all ${added ? 'opacity-40' : 'hover:bg-white/5'}`}>
                                            <img src={item.poster || 'https://via.placeholder.com/40x60'} alt="" className="w-8 h-12 object-cover rounded-lg flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-sm font-arabic truncate">{item.titleAr || item.title}</p>
                                                <span className={`text-xs px-1.5 py-0.5 rounded text-white ${item.type === 'movie' ? 'bg-orange-500/50' : 'bg-cyan-500/50'}`}>
                                                    {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
                                                </span>
                                            </div>
                                            {added ? <MdCheck className="text-green-400 flex-shrink-0" /> : <MdAdd className="text-gray-400 flex-shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* حذف قسم */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-2xl p-6 max-w-sm w-full text-center"
                            style={{ background: '#1a1a35', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <MdDelete className="text-5xl text-red-400 mx-auto mb-3" />
                            <p className="text-gray-400 text-sm font-arabic mb-5">حذف قسم "{deleteConfirm.title}"؟</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={() => handleDeleteSec(deleteConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black font-arabic">حذف</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SectionsManager;
