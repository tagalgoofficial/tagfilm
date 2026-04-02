import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdFolder, MdPlayCircle, MdChevronLeft, MdRefresh, MdDns } from 'react-icons/md';
import { getTagAlgoVideos } from '../../services/tagAlgoService';

const TagAlgoPickerModal = ({ isOpen, onClose, onSelect }) => {
    const [treeData, setTreeData] = useState({ categories: [], videos: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentPath, setCurrentPath] = useState([]); // مصفوفة مسار المجلدات (e.g. ["movies", "action"])
    const [selecting, setSelecting] = useState(false);

    const loadItems = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getTagAlgoVideos();
            // المتوقع: { categories: string[], videos: object[] }
            setTreeData(data || { categories: [], videos: [] });
        } catch (err) {
            setError('تعذر الاتصال بخادم TagAlgo.');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setCurrentPath([]);
            loadItems();
        }
    }, [isOpen, loadItems]);

    // وظيفة لاستخراج محتويات المجلد الحالي بناءً على المسار
    const getCurrentFolderContent = () => {
        const { categories = [], videos = [] } = treeData;
        const currentPathString = currentPath.join('/');

        // 1. استخراج المجلدات الفرعية (Sub-folders)
        // إذا كان المسار فارغاً، نأخذ الأجزاء الأولى من التصنيفات (e.g. "movies", "arabic")
        // إذا كان المسار "movies"، نأخذ التصنيفات التي تبدأ بـ "movies/" مثل "movies/action"
        const subFolders = new Set();
        categories.forEach(cat => {
            if (currentPath.length === 0) {
                const root = cat.split('/')[0];
                if (root) subFolders.add(root);
            } else {
                if (cat.startsWith(currentPathString + '/') && cat !== currentPathString) {
                    const relative = cat.substring(currentPathString.length + 1);
                    const folderName = relative.split('/')[0];
                    if (folderName) subFolders.add(folderName);
                }
            }
        });

        const folderItems = Array.from(subFolders).map(name => ({
            name,
            isFolder: true
        }));

        // 2. استخراج الفيديوهات التي تنتمي لهذا التصنيف بالضبط
        const videoItems = videos
            .filter(v => (v.category || '') === currentPathString)
            .map(v => ({
                ...v,
                name: v.name.replace(/\.[^/.]+$/, ""), // إزالة الامتداد (e.g. .mp4)
                isFolder: false
            }));

        return [...folderItems, ...videoItems];
    };

    const handleItemClick = (item) => {
        if (item.isFolder) {
            setCurrentPath([...currentPath, item.name]);
        } else {
            if (item.status && item.status.toLowerCase() !== 'ready') return;

            setSelecting(true);

            // بناء الرابط: /api/play/${category}/${id}
            const category = item.category || '';
            const vidId = item.id;
            const watchLink = `https://api.tagalgo.com/api/play/${encodeURIComponent(category)}/${encodeURIComponent(vidId)}`;

            const server = {
                name: `TagAlgo Server`,
                quality: 'FHD',
                type: 'hls',
                watchLink: watchLink,
                downloadLink: '',
                videoName: item.name, // حفظ اسم الفيديو للأتمتة
            };

            setTimeout(() => {
                onSelect(server, null);
                setSelecting(false);
                onClose();
            }, 300);
        }
    };

    const navigateBack = () => {
        setCurrentPath(currentPath.slice(0, -1));
    };

    if (!isOpen) return null;

    const items = getCurrentFolderContent();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
                onClick={(e) => { if (e.target === e.currentTarget && !selecting) onClose(); }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col"
                    style={{
                        background: 'linear-gradient(135deg, #1a1a35, #12122a)',
                        border: '1px solid rgba(0, 255, 128, 0.3)',
                        maxHeight: '85vh',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #00ff80, #00b359)' }}>
                                <MdDns className="text-black text-xl" />
                            </div>
                            <div>
                                <h3 className="text-white font-black font-arabic text-base">
                                    اختر من TagAlgo Server
                                </h3>
                                <p className="text-gray-400 text-xs font-arabic">
                                    {currentPath.length > 0 ? currentPath.join(' / ') : 'تصفح الخادم الخاص'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={loadItems}
                                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
                                title="تحديث البيانات"
                            >
                                <MdRefresh className="text-xl" />
                            </button>
                            {currentPath.length > 0 && !selecting && (
                                <button
                                    onClick={navigateBack}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-arabic hover:bg-white/20 transition"
                                >
                                    <MdChevronLeft className="text-base" />
                                    رجوع
                                </button>
                            )}
                            {!selecting && (
                                <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition">
                                    <MdClose className="text-xl" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* Error */}
                        {error && (
                            <div className="text-center py-8 text-red-400 font-arabic">
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Selecting overlay */}
                        {selecting && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="w-14 h-14 rounded-full border-4 border-green-400/30 border-t-green-400 animate-spin" />
                                <div className="text-center">
                                    <p className="text-white font-bold font-arabic">جارٍ إضافة ملف الفيديو...</p>
                                </div>
                            </div>
                        )}

                        {/* Loading items */}
                        {!selecting && loading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-4">
                                <div className="w-12 h-12 rounded-full border-4 border-green-400/30 border-t-green-400 animate-spin" />
                                <p className="text-gray-400 font-arabic text-sm">جارٍ تحميل البيانات من الخادم...</p>
                            </div>
                        )}

                        {/* List items */}
                        {!selecting && !loading && !error && (
                            <>
                                {items.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 font-arabic border-2 border-dashed border-white/5 rounded-2xl mx-4">
                                        المجلد فارغ
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {items.map((item, idx) => {
                                            const isProcessing = item.status && item.status.toLowerCase() === 'processing';
                                            const isFailed = item.status && item.status.toLowerCase() === 'failed';

                                            // ألوان الحالة
                                            let statusColor = 'text-gray-500';
                                            if (item.status?.toLowerCase() === 'ready') statusColor = 'text-green-400';
                                            if (isProcessing) statusColor = 'text-yellow-400';
                                            if (isFailed) statusColor = 'text-red-400';

                                            return (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={item.isFolder || !isProcessing ? { x: -4, backgroundColor: 'rgba(255,255,255,0.08)' } : {}}
                                                    onClick={() => handleItemClick(item)}
                                                    disabled={isProcessing || isFailed}
                                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-right ${item.isFolder ? 'border-white/10 hover:border-blue-400/40 bg-white/5' : 'border-white/5 hover:border-green-400/40 bg-white/[0.02]'} ${(isProcessing || isFailed) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5`}>
                                                        {item.isFolder ? (
                                                            <MdFolder className="text-2xl text-blue-400" />
                                                        ) : (
                                                            <MdPlayCircle className={`text-2xl ${item.status?.toLowerCase() === 'ready' ? 'text-green-400' : 'text-gray-400'}`} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-right min-w-0">
                                                        <p className="text-white font-bold font-arabic text-sm truncate" dir="auto">{item.name}</p>
                                                        {!item.isFolder && (
                                                            <p className={`text-[10px] font-bold font-arabic mt-1 ${statusColor}`}>
                                                                الحالة: {item.status || 'مجهول'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {item.isFolder && (
                                                        <MdChevronLeft className="text-gray-400 text-xl rotate-180" />
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer info */}
                    <div className="px-6 py-3 border-t border-white/5 flex-shrink-0 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-gray-500 text-xs font-arabic">
                            https://api.tagalgo.com · سيتم إنشاء روابط آمنة تلقائياً عند المشاهدة
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TagAlgoPickerModal;
