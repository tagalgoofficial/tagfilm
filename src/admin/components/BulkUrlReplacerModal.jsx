import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdCheck, MdLink, MdSearch, MdMovie, MdLiveTv } from 'react-icons/md';
import { getMovies, updateMovie } from '../../firebase/moviesService';
import { getSeries, updateSeries } from '../../firebase/seriesService';

const BulkUrlReplacerModal = ({ isOpen, onClose }) => {
    const [movies, setMovies] = useState([]);
    const [seriesList, setSeriesList] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [oldUrlPart, setOldUrlPart] = useState('');
    const [newUrlPart, setNewUrlPart] = useState('');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setOldUrlPart('');
            setNewUrlPart('');
            setSelectedItems(new Set());
            setMessage(null);
            setSearchQuery('');
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [m, s] = await Promise.all([getMovies(), getSeries()]);
            setMovies(m);
            setSeriesList(s);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleSelectAll = (filteredItems) => {
        const allSelected = filteredItems.every(item => selectedItems.has(item.id));
        const newSelected = new Set(selectedItems);
        
        filteredItems.forEach(item => {
            if (allSelected) {
                newSelected.delete(item.id);
            } else {
                newSelected.add(item.id);
            }
        });
        
        setSelectedItems(newSelected);
    };

    const toggleSelection = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleSave = async () => {
        if (!oldUrlPart) return alert('يرجى إدخال الجزء القديم المراد تعديله');
        if (selectedItems.size === 0) return alert('يرجى اختيار عنصر واحد على الأقل لتطبيق التعديل عليه');
        
        setSaving(true);
        setMessage(null);
        
        let movieUpdates = 0;
        let seriesUpdates = 0;
        let errors = 0;

        // Process Movies
        const moviesToProcess = movies.filter(m => selectedItems.has(m.id));
        for (const m of moviesToProcess) {
            try {
                let changed = false;
                
                const updatedServers = m.servers?.map(srv => {
                    let wLink = srv.watchLink || '';
                    let dLink = srv.downloadLink || '';
                    let srvChanged = false;
                    
                    if (wLink.includes(oldUrlPart)) { wLink = wLink.replaceAll(oldUrlPart, newUrlPart); srvChanged = true; }
                    if (dLink.includes(oldUrlPart)) { dLink = dLink.replaceAll(oldUrlPart, newUrlPart); srvChanged = true; }
                    
                    if (srvChanged) changed = true;
                    return { ...srv, watchLink: wLink, downloadLink: dLink };
                }) || [];
                
                const updatedParts = m.parts?.map(part => {
                    const pServers = part.servers?.map(srv => {
                        let wLink = srv.watchLink || '';
                        let dLink = srv.downloadLink || '';
                        let pChanged = false;
                        
                        if (wLink.includes(oldUrlPart)) { wLink = wLink.replaceAll(oldUrlPart, newUrlPart); pChanged = true; }
                        if (dLink.includes(oldUrlPart)) { dLink = dLink.replaceAll(oldUrlPart, newUrlPart); pChanged = true; }
                        
                        if (pChanged) changed = true;
                        return { ...srv, watchLink: wLink, downloadLink: dLink };
                    }) || [];
                    return { ...part, servers: pServers };
                }) || [];
                
                if (changed) {
                    await updateMovie(m.id, { servers: updatedServers, parts: updatedParts });
                    movieUpdates++;
                }
            } catch (err) {
                console.error("Error updating movie:", m.titleAr, err);
                errors++;
            }
        }

        // Process Series
        const seriesToProcess = seriesList.filter(s => selectedItems.has(s.id));
        for (const s of seriesToProcess) {
            try {
                let changed = false;
                
                const updatedSeasons = s.seasons?.map(season => {
                    const eps = season.episodes?.map(ep => {
                        const eServers = ep.servers?.map(srv => {
                            let wLink = srv.watchLink || '';
                            let dLink = srv.downloadLink || '';
                            let eChanged = false;
                            
                            if (wLink.includes(oldUrlPart)) { wLink = wLink.replaceAll(oldUrlPart, newUrlPart); eChanged = true; }
                            if (dLink.includes(oldUrlPart)) { dLink = dLink.replaceAll(oldUrlPart, newUrlPart); eChanged = true; }
                            
                            if (eChanged) changed = true;
                            return { ...srv, watchLink: wLink, downloadLink: dLink };
                        }) || [];
                        return { ...ep, servers: eServers };
                    }) || [];
                    return { ...season, episodes: eps };
                }) || [];
                
                if (changed) {
                    await updateSeries(s.id, { seasons: updatedSeasons });
                    seriesUpdates++;
                }
            } catch (err) {
                console.error("Error updating series:", s.titleAr, err);
                errors++;
            }
        }

        setSaving(false);
        setMessage({
            type: errors > 0 ? 'warning' : 'success',
            text: `تم التعديل بنجاح: ${movieUpdates} فيلم و ${seriesUpdates} مسلسل.${errors > 0 ? ` (فشل ${errors})` : ''}`
        });
        
        if (errors === 0) {
            setTimeout(() => onClose(), 2500);
        }
    };

    const combinedList = [
        ...movies.map(m => ({ ...m, _type: 'movie' })),
        ...seriesList.map(s => ({ ...s, _type: 'series' }))
    ];

    const filteredList = combinedList.filter(item => {
        const searchL = searchQuery.toLowerCase();
        return (
            (item.titleAr && item.titleAr.toLowerCase().includes(searchL)) ||
            (item.titleEn && item.titleEn.toLowerCase().includes(searchL))
        );
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-4xl bg-[#0f0f23] border border-white/10 rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                                <MdLink className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-arabic text-white">استبدال الروابط المجمع</h3>
                                <p className="text-sm text-gray-400 font-arabic">استبدال دومين أو مسار في روابط المشاهدة والتحميل لعدة أعمال بضغطة واحدة</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 transition">
                            <MdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        
                        {/* Right/Main panel - Inputs & Actions */}
                        <div className="p-6 border-b md:border-b-0 md:border-l border-white/10 w-full md:w-1/3 flex flex-col gap-5 bg-white/5 overflow-y-auto">
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-2 block font-semibold">ابحث عن (الجزء القديم) <span className="text-red-400">*</span></label>
                                    <input 
                                        type="text"
                                        value={oldUrlPart}
                                        onChange={e => setOldUrlPart(e.target.value)}
                                        placeholder="مثال: vid1.rma-2026-zvde.site"
                                        dir="ltr"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                                    />
                                </div>
                                
                                <div>
                                    <label className="text-gray-300 text-sm font-arabic mb-2 block font-semibold">استبدال بـ (الجزء الجديد)</label>
                                    <input 
                                        type="text"
                                        value={newUrlPart}
                                        onChange={e => setNewUrlPart(e.target.value)}
                                        placeholder="مثال: vid3.rma2-2026.store"
                                        dir="ltr"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-green-500 transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 font-arabic leading-relaxed">
                                        سيتم استبدال هذا الجزء في جميع السيرفرات الخاصة بالأفلام والمسلسلات المُختارة.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 flex flex-col gap-3">
                                {message && (
                                    <div className={`p-3 rounded-lg text-sm font-arabic text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                                        {message.text}
                                    </div>
                                )}
                                
                                <button 
                                    onClick={handleSave}
                                    disabled={saving || !oldUrlPart || selectedItems.size === 0}
                                    className="w-full py-4 rounded-xl font-bold font-arabic text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500"
                                >
                                    {saving ? (
                                        <span className="animate-pulse">جارٍ التحديث ({selectedItems.size} أعمال)...</span>
                                    ) : (
                                        <>
                                            <MdCheck className="text-xl" />
                                            استبدال في ({selectedItems.size}) عمل
                                        </>
                                    )}
                                </button>
                                <button onClick={onClose} className="w-full py-3 rounded-xl font-arabic text-gray-400 hover:text-white hover:bg-white/5 transition">
                                    إلغاء
                                </button>
                            </div>
                        </div>

                        {/* Left panel - Selection list */}
                        <div className="w-full md:w-2/3 flex flex-col p-6">
                            <div className="flex items-center justify-between mb-4 gap-4">
                                <h4 className="text-lg font-bold text-white font-arabic">الأعمال المستهدفة</h4>
                                <div className="relative flex-1 max-w-xs">
                                    <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="بحث بالاسم..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-purple-500 transition font-arabic"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-t-xl border border-white/10">
                                <label className="flex items-center gap-3 cursor-pointer select-none">
                                    <input 
                                        type="checkbox"
                                        checked={filteredList.length > 0 && filteredList.every(item => selectedItems.has(item.id))}
                                        onChange={() => handleSelectAll(filteredList)}
                                        className="w-4 h-4 rounded bg-black/50 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                                    />
                                    <span className="text-sm font-arabic font-bold text-white">تحديد الكل ({filteredList.length})</span>
                                </label>
                                <span className="text-xs text-gray-400 font-arabic">{selectedItems.size} محدد</span>
                            </div>

                            <div className="flex-1 overflow-y-auto border-x border-b border-white/10 rounded-b-xl hide-scrollbar bg-black/20">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full text-gray-400 font-arabic">جارٍ التحميل...</div>
                                ) : filteredList.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500 font-arabic">لا توجد أعمال مطابقة.</div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {filteredList.map(item => (
                                            <label key={item.id} className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer transition">
                                                <input 
                                                    type="checkbox"
                                                    checked={selectedItems.has(item.id)}
                                                    onChange={() => toggleSelection(item.id)}
                                                    className="w-4 h-4 rounded bg-black/50 border-white/20 text-purple-600 focus:ring-purple-500 focus:ring-offset-gray-900"
                                                />
                                                <img src={item.poster || item.backdrop} alt={item.titleAr} className="w-10 h-14 object-cover rounded shadow-md border border-white/10" />
                                                <div className="flex-1 overflow-hidden">
                                                    <h5 className="text-sm font-bold text-white font-arabic truncate">{item.titleAr || item.title}</h5>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item._type === 'movie' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                                                            {item._type === 'movie' ? <MdMovie className="inline mr-1" /> : <MdLiveTv className="inline mr-1" />}
                                                            {item._type === 'movie' ? 'فيلم' : 'مسلسل'}
                                                        </span>
                                                        <span className="text-xs text-gray-500 truncate">{item.year} • {item.quality}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default BulkUrlReplacerModal;
