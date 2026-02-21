import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdClose, MdStar, MdCheckCircle } from 'react-icons/md';
import { searchMovies, searchSeries, getMovieDetails, getSeriesDetails } from '../../services/tmdbService';

const TMDBSearchModal = ({ isOpen, onClose, onSelect, type = 'movie' }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(null);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setError('');
        try {
            const data = type === 'movie' ? await searchMovies(query) : await searchSeries(query);
            setResults(data);
        } catch {
            setError('حدث خطأ أثناء البحث، تحقق من الاتصال');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (item) => {
        setLoadingDetail(item.id);
        try {
            const details = type === 'movie'
                ? await getMovieDetails(item.id)
                : await getSeriesDetails(item.id);
            onSelect(details);
            onClose();
        } catch {
            setError('فشل في جلب التفاصيل');
        } finally {
            setLoadingDetail(null);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-2xl rounded-2xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #1a1a35, #12122a)',
                        border: '1px solid rgba(255,215,0,0.2)',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
                        maxHeight: '80vh',
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                                <MdSearch className="text-black text-base" />
                            </div>
                            <div>
                                <h3 className="text-white font-black font-arabic">
                                    بحث {type === 'movie' ? 'أفلام' : 'مسلسلات'} TMDB
                                </h3>
                                <p className="text-xs text-gray-400">سيتم جلب البيانات تلقائياً</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition">
                            <MdClose className="text-xl" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="p-5 border-b border-white/10">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={`اكتب اسم ${type === 'movie' ? 'الفيلم' : 'المسلسل'}...`}
                                    className="w-full bg-white/5 border border-white/15 rounded-xl py-3 pr-10 pl-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400/60 transition font-arabic"
                                    dir="rtl"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={loading}
                                className="px-5 py-3 rounded-xl text-black font-bold text-sm transition-all disabled:opacity-50 flex-shrink-0"
                                style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                            >
                                {loading ? '...' : 'بحث'}
                            </button>
                        </div>
                        {error && <p className="text-red-400 text-sm mt-2 font-arabic">{error}</p>}
                    </div>

                    {/* Results */}
                    <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                        {results.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <MdSearch className="text-6xl text-gray-600 mb-3" />
                                <p className="text-gray-400 font-arabic">ابحث عن {type === 'movie' ? 'فيلم' : 'مسلسل'} لجلب بياناته تلقائياً</p>
                            </div>
                        )}
                        {results.map((item) => {
                            const title = type === 'movie' ? item.title : item.name;
                            const year = (item.release_date || item.first_air_date || '').split('-')[0];
                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    disabled={!!loadingDetail}
                                    whileHover={{ backgroundColor: 'rgba(255,215,0,0.07)' }}
                                    className="w-full flex items-center gap-4 px-5 py-4 border-b border-white/5 text-right transition-all"
                                >
                                    <img
                                        src={item.poster_url || 'https://via.placeholder.com/60x90?text=N/A'}
                                        alt={title}
                                        className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate font-arabic">{title}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-gray-400 text-xs">{year}</span>
                                            <div className="flex items-center gap-1">
                                                <MdStar className="text-yellow-400 text-xs" />
                                                <span className="text-yellow-400 text-xs">{item.vote_average?.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-xs mt-1 line-clamp-1 font-arabic">{item.overview}</p>
                                    </div>
                                    {loadingDetail === item.id ? (
                                        <div className="w-8 h-8 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin flex-shrink-0" />
                                    ) : (
                                        <MdCheckCircle className="text-green-400 text-xl opacity-0 group-hover:opacity-100 flex-shrink-0" />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TMDBSearchModal;
