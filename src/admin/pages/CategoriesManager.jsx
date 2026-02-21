import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCheck, MdCategory, MdExpandMore, MdExpandLess } from 'react-icons/md';
import {
    getCategories, addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory,
    initDefaultCategories
} from '../../firebase/categoriesService';

const ICON_OPTIONS = ['movies', 'series', 'ramadan', 'other'];

const CategoriesManager = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    // نموذج تصنيف رئيسي
    const [catModal, setCatModal] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [catForm, setCatForm] = useState({ label: '', labelEn: '', icon: 'movies', order: 1 });

    // نموذج تصنيف فرعي
    const [subModal, setSubModal] = useState(null); // { categoryId, editSub }
    const [subName, setSubName] = useState('');

    // حذف
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleteSubConfirm, setDeleteSubConfirm] = useState(null);

    const load = async () => {
        setLoading(true);
        await initDefaultCategories();
        const cats = await getCategories();
        setCategories(cats);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSaveCat = async () => {
        if (!catForm.label) return alert('الاسم مطلوب');
        if (editCat) { await updateCategory(editCat.id, catForm); }
        else { await addCategory(catForm); }
        setCatModal(false); setEditCat(null);
        setCatForm({ label: '', labelEn: '', icon: 'movies', order: 1 });
        await load();
    };

    const handleDeleteCat = async (id) => {
        await deleteCategory(id); setDeleteConfirm(null); await load();
    };

    const handleSaveSub = async () => {
        if (!subName.trim()) return;
        if (subModal?.editSub) {
            await updateSubcategory(subModal.categoryId, subModal.editSub.id, subName);
        } else {
            await addSubcategory(subModal.categoryId, subName);
        }
        setSubModal(null); setSubName(''); await load();
    };

    const handleDeleteSub = async () => {
        await deleteSubcategory(deleteSubConfirm.categoryId, deleteSubConfirm.sub.id);
        setDeleteSubConfirm(null); await load();
    };

    const catColors = ['#ffd700', '#00d4ff', '#a855f7', '#22c55e'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white font-arabic">إدارة التصنيفات</h1>
                    <p className="text-gray-400 text-sm font-arabic">{categories.length} تصنيفات رئيسية</p>
                </div>
                <button onClick={() => { setEditCat(null); setCatForm({ label: '', labelEn: '', icon: 'movies', order: categories.length + 1 }); setCatModal(true); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-black font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                    <MdAdd /> إضافة تصنيف
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
                <div className="space-y-4">
                    {categories.map((cat, idx) => {
                        const color = catColors[idx % catColors.length];
                        return (
                            <motion.div key={cat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                                className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${color}30` }}>
                                {/* تصنيف رئيسي */}
                                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                                    style={{ background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.03))` }}
                                    onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}>
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                                        <MdCategory className="text-white text-lg" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-black font-arabic text-base">{cat.label}</p>
                                        <p className="text-gray-400 text-xs">{cat.labelEn} • {cat.subcategories?.length || 0} تصنيفات فرعية</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); setEditCat(cat); setCatForm({ label: cat.label, labelEn: cat.labelEn, icon: cat.icon, order: cat.order }); setCatModal(true); }}
                                            className="p-2 rounded-xl text-yellow-400 hover:bg-yellow-400/10 border border-yellow-400/20 transition">
                                            <MdEdit className="text-sm" />
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(cat); }}
                                            className="p-2 rounded-xl text-red-400 hover:bg-red-400/10 border border-red-400/20 transition">
                                            <MdDelete className="text-sm" />
                                        </button>
                                        {expanded === cat.id ? <MdExpandLess style={{ color }} /> : <MdExpandMore className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* التصنيفات الفرعية */}
                                <AnimatePresence>
                                    {expanded === cat.id && (
                                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                            <div className="px-5 py-4 border-t" style={{ borderColor: `${color}20` }}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <p className="text-sm font-arabic font-semibold" style={{ color }}>التصنيفات الفرعية</p>
                                                    <button onClick={() => { setSubModal({ categoryId: cat.id }); setSubName(''); }}
                                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-Arabic font-semibold text-white"
                                                        style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                                                        <MdAdd /> إضافة
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {cat.subcategories?.map(sub => (
                                                        <div key={sub.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-arabic"
                                                            style={{ background: `${color}15`, border: `1px solid ${color}30`, color: 'white' }}>
                                                            <span>{sub.name}</span>
                                                            <button onClick={() => { setSubModal({ categoryId: cat.id, editSub: sub }); setSubName(sub.name); }}
                                                                className="text-gray-400 hover:text-white transition ml-0.5">
                                                                <MdEdit className="text-xs" />
                                                            </button>
                                                            <button onClick={() => setDeleteSubConfirm({ categoryId: cat.id, sub })}
                                                                className="text-red-400 hover:text-red-300 transition">
                                                                <MdClose className="text-xs" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!cat.subcategories || cat.subcategories.length === 0) && (
                                                        <p className="text-gray-500 text-sm font-arabic">لا توجد تصنيفات فرعية</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* مودال تصنيف رئيسي */}
            <AnimatePresence>
                {catModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-md rounded-2xl p-6"
                            style={{ background: '#1a1a35', border: '1px solid rgba(168,85,247,0.3)' }}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-white font-black font-arabic text-lg">{editCat ? 'تعديل التصنيف' : 'إضافة تصنيف'}</h3>
                                <button onClick={() => { setCatModal(false); setEditCat(null); }} className="text-gray-400 hover:text-white"><MdClose /></button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">الاسم بالعربي *</label>
                                    <input value={catForm.label} onChange={e => setCatForm(p => ({ ...p, label: e.target.value }))}
                                        placeholder="مثال: الأفلام" dir="rtl"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-400/60 transition font-arabic" />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">الاسم بالإنجليزي</label>
                                    <input value={catForm.labelEn} onChange={e => setCatForm(p => ({ ...p, labelEn: e.target.value }))}
                                        placeholder="e.g. Movies"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-400/60 transition" />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-1 block">الترتيب</label>
                                    <input type="number" value={catForm.order} onChange={e => setCatForm(p => ({ ...p, order: parseInt(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-400/60 transition" />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => { setCatModal(false); setEditCat(null); }}
                                    className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={handleSaveCat}
                                    className="flex-1 py-3 rounded-xl text-white font-black font-arabic flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                                    <MdCheck /> {editCat ? 'حفظ' : 'إضافة'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* مودال تصنيف فرعي */}
            <AnimatePresence>
                {subModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-sm rounded-2xl p-6"
                            style={{ background: '#1a1a35', border: '1px solid rgba(168,85,247,0.3)' }}>
                            <h3 className="text-white font-black font-arabic text-lg mb-4">
                                {subModal.editSub ? 'تعديل التصنيف الفرعي' : 'إضافة تصنيف فرعي'}
                            </h3>
                            <input value={subName} onChange={e => setSubName(e.target.value)}
                                placeholder="اسم التصنيف الفرعي" dir="rtl" onKeyDown={e => e.key === 'Enter' && handleSaveSub()}
                                className="w-full bg-white/5 border border-white/15 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-400/60 transition font-arabic mb-4" />
                            <div className="flex gap-3">
                                <button onClick={() => { setSubModal(null); setSubName(''); }}
                                    className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={handleSaveSub}
                                    className="flex-1 py-3 rounded-xl text-white font-black font-arabic"
                                    style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                                    {subModal.editSub ? 'حفظ' : 'إضافة'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* حذف تصنيف رئيسي */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-2xl p-6 max-w-sm w-full text-center"
                            style={{ background: '#1a1a35', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <MdDelete className="text-5xl text-red-400 mx-auto mb-3" />
                            <h3 className="text-white font-black font-arabic mb-2">حذف التصنيف؟</h3>
                            <p className="text-gray-400 text-sm font-arabic mb-5">حذف "{deleteConfirm.label}" وجميع تصنيفاته الفرعية؟</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={() => handleDeleteCat(deleteConfirm.id)} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black font-arabic">حذف</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* حذف تصنيف فرعي */}
            <AnimatePresence>
                {deleteSubConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-2xl p-6 max-w-sm w-full text-center"
                            style={{ background: '#1a1a35', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <MdClose className="text-5xl text-red-400 mx-auto mb-3" />
                            <h3 className="text-white font-black font-arabic mb-2">حذف التصنيف الفرعي؟</h3>
                            <p className="text-gray-400 text-sm font-arabic mb-5">حذف "{deleteSubConfirm.sub.name}"؟</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteSubConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-arabic">إلغاء</button>
                                <button onClick={handleDeleteSub} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black font-arabic">حذف</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategoriesManager;
