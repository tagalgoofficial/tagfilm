import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdClose, MdCheck, MdCategory, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import {
    getCategories, addCategory, updateCategory, deleteCategory,
    addSubcategory, updateSubcategory, deleteSubcategory,
    initDefaultCategories
} from '../../firebase/categoriesService';

const MovieCategoriesManager = () => {
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
        const allCats = await getCategories();
        // تصفية تصنيفات الأفلام فقط
        const movieCats = allCats.filter(c => c.icon === 'movies');
        setCategories(movieCats);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleSaveCat = async () => {
        if (!catForm.label) return alert('الاسم مطلوب');
        if (editCat) { await updateCategory(editCat.id, catForm); }
        else { await addCategory(catForm); }
        setCatModal(false); setEditCat(null);
        setCatForm({ label: '', labelEn: '', icon: 'movies', order: categories.length + 1 });
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

    // ألوان مميزة لتصنيفات الأفلام
    const catColors = ['#ffd700', '#ff8c00', '#ff4500', '#ff1493', '#00ced1', '#adff2f', '#ffa07a'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/20">
                            <BiCameraMovie className="text-black text-xl" />
                        </div>
                        <h1 className="text-2xl font-black text-white font-arabic">إدارة تصنيفات الأفلام</h1>
                    </div>
                    <p className="text-gray-400 text-sm font-arabic">التحقق من وإدارة التصنيفات السبعة الأساسية للأفلام</p>
                </div>
                <button onClick={() => { setEditCat(null); setCatForm({ label: '', labelEn: '', icon: 'movies', order: categories.length + 1 }); setCatModal(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-black font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20"
                    style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                    <MdAdd className="text-lg" /> إضافة تصنيف أفلام
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categories.map((cat, idx) => {
                        const color = catColors[idx % catColors.length];
                        return (
                            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                                className="rounded-2xl overflow-hidden border border-white/5 bg-[#1a1a35]/50 backdrop-blur-sm"
                                style={{ borderRight: `4px solid ${color}` }}>

                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                                style={{ background: `${color}15`, color: color }}>
                                                <BiCameraMovie />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-black font-arabic text-lg leading-tight">{cat.label}</h3>
                                                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{cat.labelEn}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => { setEditCat(cat); setCatForm({ label: cat.label, labelEn: cat.labelEn, icon: cat.icon, order: cat.order }); setCatModal(true); }}
                                                className="p-2 rounded-xl text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition">
                                                <MdEdit />
                                            </button>
                                            <button onClick={() => setDeleteConfirm(cat)}
                                                className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition">
                                                <MdDelete />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-arabic font-bold text-gray-400">التصنيفات الفرعية ({cat.subcategories?.length || 0})</p>
                                            <button onClick={() => { setSubModal({ categoryId: cat.id }); setSubName(''); }}
                                                className="text-[10px] font-arabic font-black bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/10 transition">
                                                + إضافة فرعي
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {cat.subcategories?.map(sub => (
                                                <div key={sub.id} className="group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-arabic bg-white/5 border border-white/5 hover:border-yellow-400/30 transition-all">
                                                    <span className="text-gray-200">{sub.name}</span>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setSubModal({ categoryId: cat.id, editSub: sub }); setSubName(sub.name); }}
                                                            className="text-yellow-400/70 hover:text-yellow-400"><MdEdit className="text-[10px]" /></button>
                                                        <button onClick={() => setDeleteSubConfirm({ categoryId: cat.id, sub })}
                                                            className="text-red-400/70 hover:text-red-400"><MdClose className="text-[10px]" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!cat.subcategories || cat.subcategories.length === 0) && (
                                                <p className="text-gray-600 text-[10px] font-arabic italic">لا توجد تصنيفات فرعية لهذا النوع</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* مودالات الإضافة والتعديل والحذف (نفس منطق CategoriesManager مع تنسيق متناسق) */}
            <AnimatePresence>
                {catModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-md rounded-3xl p-8"
                            style={{ background: 'linear-gradient(135deg, #1a1a35, #12122a)', border: '1px solid rgba(255,215,0,0.2)' }}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-white font-black font-arabic text-xl">{editCat ? 'تعديل التصنيف' : 'إضافة تصنيف أفلام'}</h3>
                                <button onClick={() => { setCatModal(false); setEditCat(null); }} className="text-gray-400 hover:text-white"><MdClose className="text-2xl" /></button>
                            </div>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-gray-400 text-xs font-arabic mb-2 block mr-1">الاسم بالعربي *</label>
                                    <input value={catForm.label} onChange={e => setCatForm(p => ({ ...p, label: e.target.value }))}
                                        placeholder="مثال: أفلام رعب" dir="rtl"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition font-arabic" />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs font-arabic mb-2 block mr-1">الاسم بالإنجليزي</label>
                                    <input value={catForm.labelEn} onChange={e => setCatForm(p => ({ ...p, labelEn: e.target.value }))}
                                        placeholder="e.g. Horror Movies"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition" />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs font-arabic mb-2 block mr-1">الترتيب في القائمة</label>
                                    <input type="number" value={catForm.order} onChange={e => setCatForm(p => ({ ...p, order: parseInt(e.target.value) }))}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition" />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button onClick={() => { setCatModal(false); setEditCat(null); }}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-gray-400 font-arabic font-bold border border-white/10 hover:bg-white/10 transition">إلغاء</button>
                                <button onClick={handleSaveCat}
                                    className="flex-1 py-4 rounded-2xl text-black font-black font-arabic shadow-lg shadow-yellow-400/20"
                                    style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                                    <MdCheck className="inline-block ml-2 text-lg" /> {editCat ? 'حفظ التغييرات' : 'إضافة الآن'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* مودال تصنيف فرعي */}
                {subModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="w-full max-w-sm rounded-3xl p-8"
                            style={{ background: 'linear-gradient(135deg, #1a1a35, #12122a)', border: '1px solid rgba(255,215,0,0.2)' }}>
                            <h3 className="text-white font-black font-arabic text-lg mb-6 text-center">
                                {subModal.editSub ? 'تعديل التصنيف الفرعي' : 'إضافة تصنيف فرعي جديد'}
                            </h3>
                            <input value={subName} onChange={e => setSubName(e.target.value)}
                                placeholder="مثلاً: أكشن، دراما، غموض..." dir="rtl" onKeyDown={e => e.key === 'Enter' && handleSaveSub()}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-yellow-400/50 transition font-arabic mb-6 text-center" />
                            <div className="flex gap-3">
                                <button onClick={() => { setSubModal(null); setSubName(''); }}
                                    className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-400 font-arabic font-bold border border-white/10">إلغاء</button>
                                <button onClick={handleSaveSub}
                                    className="flex-1 py-3.5 rounded-2xl text-black font-black font-arabic"
                                    style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                                    {subModal.editSub ? 'حفظ' : 'إضافة'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* حذف تصنيف رئيسي */}
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.9)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-3xl p-8 max-w-sm w-full text-center"
                            style={{ background: '#12122a', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                <MdDelete className="text-4xl text-red-500" />
                            </div>
                            <h3 className="text-white font-black font-arabic text-xl mb-3">حذف تصنيف الأفلام؟</h3>
                            <p className="text-gray-400 text-sm font-arabic mb-8 leading-relaxed">
                                هل أنت متأكد من حذف "{deleteConfirm.label}"؟ <br /> <span className="text-red-400 text-xs">سيتم حذف جميع التصنيفات الفرعية المرتبطة به أيضاً.</span>
                            </p>
                            <div className="flex gap-4">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-400 font-arabic font-bold border border-white/10 hover:bg-white/10 transition">إلغاء</button>
                                <button onClick={() => handleDeleteCat(deleteConfirm.id)} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-black font-arabic shadow-lg shadow-red-500/20 hover:bg-red-600 transition">حذف نهائي</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* حذف تصنيف فرعي */}
                {deleteSubConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.85)' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="rounded-3xl p-8 max-w-sm w-full text-center"
                            style={{ background: '#12122a', border: '1px solid rgba(255,50,50,0.3)' }}>
                            <h3 className="text-white font-black font-arabic text-lg mb-3">حذف التصنيف الفرعي؟</h3>
                            <p className="text-gray-400 text-sm font-arabic mb-6">حذف "{deleteSubConfirm.sub.name}" من القائمة؟</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteSubConfirm(null)} className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-400 font-arabic font-bold">تراجع</button>
                                <button onClick={handleDeleteSub} className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white font-black font-arabic">حذف</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MovieCategoriesManager;
