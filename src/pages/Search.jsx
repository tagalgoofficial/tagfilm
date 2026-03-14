import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdFilterList, MdMovie, MdTv, MdStar } from 'react-icons/md';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';
import { getCategories } from '../firebase/categoriesService';
import Header from '../components/Header';

export default function Search() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allMedia, setAllMedia] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        type: 'all', // all, movie, series
        category: 'all',
        year: 'all',
        rating: 'all'
    });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movies, series, cats] = await Promise.all([
                    getMovies(),
                    getSeries(),
                    getCategories()
                ]);
                setAllMedia([...movies.map(m => ({ ...m, type: 'movie' })), ...series.map(s => ({ ...s, type: 'series' }))]);
                setCategories(cats);
            } catch (error) {
                console.error("Error fetching data for search:", error);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = allMedia;

        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(item =>
                (item.titleAr && item.titleAr.toLowerCase().includes(q)) ||
                (item.title && item.title.toLowerCase().includes(q)) ||
                (item.overview && item.overview.toLowerCase().includes(q))
            );
        }

        if (filters.type !== 'all') {
            filtered = filtered.filter(item => item.type === filters.type);
        }

        if (filters.category !== 'all') {
            filtered = filtered.filter(item => item.categories?.includes(filters.category) || item.category === filters.category);
        }

        if (filters.year !== 'all') {
            filtered = filtered.filter(item => item.year === filters.year);
        }

        if (filters.rating !== 'all') {
            filtered = filtered.filter(item => parseFloat(item.rating) >= parseFloat(filters.rating));
        }

        setResults(filtered);
    }, [query, filters, allMedia]);

    const years = [...new Set(allMedia.map(m => m.year))].sort((a, b) => b - a);

    return (
        <div className="min-h-screen bg-[#050514] text-white font-arabic" dir="rtl">
            <Header />

            <div className="container mx-auto px-4 md:px-12 pt-32 pb-20">
                {/* Search Bar */}
                <div className="relative max-w-4xl mx-auto mb-12">
                    <div className="relative group">
                        <MdSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="ابحث عن أفلام، مسلسلات، أو ممثلين..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all shadow-2xl"
                        />
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${showFilters ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                        >
                            <MdFilterList className="text-2xl" />
                        </button>
                    </div>

                    {/* Filters Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-4 bg-white/5 rounded-2xl border border-white/10 p-6 grid grid-cols-2 md:grid-cols-4 gap-6"
                            >
                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 mr-1">النوع</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="all">الكل</option>
                                        <option value="movie">أفلام</option>
                                        <option value="series">مسلسلات</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 mr-1">التصنيف</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="all">كل التصنيفات</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 mr-1">السنة</label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="all">كل السنين</option>
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-400 text-xs mb-2 mr-1">التقييم أعلى من</label>
                                    <select
                                        value={filters.rating}
                                        onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all text-sm"
                                    >
                                        <option value="all">أي تقييم</option>
                                        {[9, 8, 7, 6, 5].map(r => (
                                            <option key={r} value={r}>{r}+ نجوم</option>
                                        ))}
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Results Info */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        نتائج البحث
                        <span className="text-sm font-normal text-gray-500">({results.length} نتيجة)</span>
                    </h2>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {results.map((item) => (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -10 }}
                            onClick={() => navigate(`/${item.type}/${item.id}`)}
                            className="group cursor-pointer"
                        >
                            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-3 border border-white/5 bg-white/5">
                                <img
                                    src={item.poster}
                                    alt={item.titleAr || item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                                {/* Type Badge */}
                                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                    {item.type === 'movie' ? <MdMovie className="text-blue-500" /> : <MdTv className="text-cyan-500" />}
                                    <span className="text-[10px] font-bold uppercase">{item.type === 'movie' ? 'فيلم' : 'مسلسل'}</span>
                                </div>

                                {/* Rating Badge */}
                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-yellow-400 font-bold text-sm bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                    <MdStar />
                                    {item.rating}
                                </div>
                            </div>
                            <h3 className="font-bold text-sm truncate group-hover:text-blue-500 transition-colors px-1">
                                {item.titleAr || item.title}
                            </h3>
                            <p className="text-gray-500 text-xs px-1 mt-1">{item.year}</p>
                        </motion.div>
                    ))}
                </div>

                {results.length === 0 && !loading && (
                    <div className="text-center py-40">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdSearch className="text-5xl text-gray-700" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">لم نجد أي نتائج</h3>
                        <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير الفلاتر</p>
                    </div>
                )}
            </div>
        </div>
    );
}
