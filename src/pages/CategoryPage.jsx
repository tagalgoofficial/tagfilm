import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdMovieFilter } from 'react-icons/md';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { getCategories } from '../firebase/categoriesService';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';

const CategoryPage = () => {
    const { categoryId, subcategory } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [allContent, setAllContent] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeSubcat, setActiveSubcat] = useState(subcategory ? decodeURIComponent(subcategory) : 'all');
    const [contentType, setContentType] = useState('all');
    const [categoriesList, setCategoriesList] = useState([]);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [cats, movies, series] = await Promise.all([
                    getCategories(),
                    getMovies(),
                    getSeries(),
                ]);

                setCategoriesList(cats);

                let cat, moviesFiltered, seriesFiltered;

                if (categoryId === 'movies') {
                    cat = { id: 'movies', label: 'جميع الأفلام' };
                    moviesFiltered = movies.map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = [];
                } else if (categoryId === 'series') {
                    cat = { id: 'series', label: 'جميع المسلسلات' };
                    seriesFiltered = series.map(s => ({ ...s, _type: 'series' }));
                    moviesFiltered = [];
                } else {
                    cat = cats.find(c => c.id === categoryId);
                    moviesFiltered = movies
                        .filter(m => m.category === categoryId)
                        .map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series
                        .filter(s => s.category === categoryId)
                        .map(s => ({ ...s, _type: 'series' }));
                }

                setCategory(cat);
                const combined = [...moviesFiltered, ...seriesFiltered];
                setAllContent(combined);
                setFiltered(combined);
            } catch (error) {
                console.error("Error loading category content:", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [categoryId]);

    useEffect(() => {
        let result = [...allContent];

        if (contentType === 'movies') result = result.filter(i => i._type === 'movie');
        if (contentType === 'series') result = result.filter(i => i._type === 'series');

        if (activeSubcat !== 'all') {
            result = result.filter(i => i.subcategory === activeSubcat);
        }

        if (activeCategoryFilter !== 'all') {
            result = result.filter(i => i.category === activeCategoryFilter);
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(i =>
                i.titleAr?.includes(q) ||
                i.title?.toLowerCase().includes(q)
            );
        }

        setFiltered(result);
    }, [search, activeSubcat, contentType, allContent, activeCategoryFilter]);

    const categoryLabel = category?.label || 'التصنيف';
    const moviesCount = allContent.filter(i => i._type === 'movie').length;
    const seriesCount = allContent.filter(i => i._type === 'series').length;

    return (
        <div className="min-h-screen pb-20 transition-colors duration-500" style={{ background: 'var(--bg-site)' }} dir="rtl" lang="ar">
            <Header />

            <main className="container mx-auto px-6 pt-32 lg:pt-40">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2 lg:px-4">
                    <div className="relative">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 mb-4"
                        >
                            <div className="w-2 h-10 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg" />
                            <h1 className="text-4xl lg:text-5xl font-black text-main font-arabic tracking-tight">
                                {categoryLabel}
                            </h1>
                        </motion.div>
                        <nav className="flex items-center gap-2 text-muted text-sm font-arabic mr-6">
                            <Link to="/" className="hover:text-yellow-400 transition">الرئيسية</Link>
                            <span>/</span>
                            <span className="text-yellow-400 font-bold">{categoryLabel}</span>
                        </nav>
                    </div>

                    {/* Stats or Filter */}
                    <div className="flex items-center gap-4 text-xs font-arabic mr-6 md:mr-0">
                        <div className="px-6 py-3 rounded-2xl bg-card border border-white/5 text-muted shadow-xl flex items-center gap-3">
                            <div className="flex flex-col items-center border-l border-white/10 pl-3 ml-3">
                                <span className="text-yellow-400 font-black text-lg">{moviesCount}</span>
                                <span>أفلام</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-cyan-400 font-black text-lg">{seriesCount}</span>
                                <span>مسلسلات</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search & Filters Section */}
                <div className="flex flex-col gap-8 mb-12 px-2 lg:px-4">
                    {/* Search Bar */}
                    <div className="relative max-w-2xl w-full">
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder={categoryId === 'series' ? "ابحث في المسلسلات..." : "ابحث في الأفلام..."}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-card border border-white/5 rounded-2xl py-4 pr-12 pl-6 text-main font-arabic focus:outline-none focus:border-yellow-400/50 transition-all shadow-xl"
                        />
                    </div>

                    {/* Category Chips */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategoryFilter('all')}
                            className={`px-8 py-3 rounded-2xl font-arabic text-sm font-bold transition-all duration-300 whitespace-nowrap border ${activeCategoryFilter === 'all'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-transparent shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                                : 'bg-card text-muted border-white/5 hover:border-white/20'
                                }`}
                        >
                            الكل
                        </motion.button>
                        {categoriesList
                            .filter(cat => allContent.some(item => item.category === cat.id))
                            .map((cat) => (
                                <motion.button
                                    key={cat.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveCategoryFilter(cat.id)}
                                    className={`px-8 py-3 rounded-2xl font-arabic text-sm font-bold transition-all duration-300 whitespace-nowrap border ${activeCategoryFilter === cat.id
                                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-transparent shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                                        : 'bg-card text-muted border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    {cat.label}
                                </motion.button>
                            ))}
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="aspect-[2/3] rounded-[2rem] bg-card/50 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 lg:gap-10"
                    >
                        {filtered.map((item) => (
                            <MovieCard key={item.id} movie={item} />
                        ))}
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <MdMovieFilter className="text-8xl text-muted opacity-20 mb-6" />
                        <h2 className="text-2xl font-bold text-main font-arabic mb-2">لا يوجد محتوى حالياً</h2>
                        <p className="text-muted font-arabic">جارٍ إضافة المزيد من المحتوى قريباً، ابقَ متيقظاً!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoryPage;
