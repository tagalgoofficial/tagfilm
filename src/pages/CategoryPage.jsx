import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MdArrowBack, MdMovieFilter } from 'react-icons/md';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import HeroBanner from '../components/HeroBanner';
import { getCategories } from '../firebase/categoriesService';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';
import { getFeatured } from '../firebase/featuredService';

const CategoryPage = () => {
    const { categoryId, subcategory } = useParams();
    const navigate = useNavigate();

    const [category, setCategory] = useState(null);
    const [allContent, setAllContent] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroLoading, setHeroLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeSubcat, setActiveSubcat] = useState(subcategory ? decodeURIComponent(subcategory) : 'all');
    const [contentType, setContentType] = useState('all');
    const [categoriesList, setCategoriesList] = useState([]);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setHeroLoading(true);
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
                } else if (categoryId === 'tv-shows') {
                    // Find actual category in DB that represents TV Shows
                    cat = cats.find(c => c.labelEn === 'Others' || c.label === 'أخرى' || c.icon === 'other') || { label: 'البرامج التلفزيونية' };
                    moviesFiltered = movies.filter(m => m.category === cat.id && m.subcategory === 'برامج').map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series.filter(s => s.category === cat.id && s.subcategory === 'برامج').map(s => ({ ...s, _type: 'series' }));
                } else if (categoryId === 'kids') {
                    cat = cats.find(c => c.labelEn === 'Others' || c.label === 'أخرى' || c.icon === 'other') || { label: 'أطفال' };
                    moviesFiltered = movies.filter(m => m.category === cat.id && m.subcategory === 'أطفال').map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series.filter(s => s.category === cat.id && s.subcategory === 'أطفال').map(s => ({ ...s, _type: 'series' }));
                } else if (categoryId === 'ramadan') {
                    cat = cats.find(c => c.icon === 'ramadan') || { label: 'رمضان' };
                    moviesFiltered = movies.filter(m => m.category === cat.id).map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series.filter(s => s.category === cat.id).map(s => ({ ...s, _type: 'series' }));
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

                // جلب المحتوى المميز الخاص بهذا التصنيف تحديداً
                // نسخدم slug الرابط للأقسام الخاصة، والـ ID للأقسام العادية
                const specialSlugs = ['movies', 'series', 'ramadan', 'kids', 'tv-shows'];
                const featId = specialSlugs.includes(categoryId) ? categoryId : (cat?.id || categoryId);

                const feat = await getFeatured(featId);
                setFeatured(feat);
                setHeroLoading(false);
            } catch (error) {
                console.error("Error loading category content:", error);
                setHeroLoading(false);
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

            {/* Hero Banner Section */}
            {heroLoading ? (
                <div className="w-full animate-pulse" style={{ height: '70vh', background: 'linear-gradient(135deg, #0a0a1f, #1a1a3e)' }} />
            ) : featured.length > 0 && (
                <div className="w-full mb-12 sm:mb-20">
                    <HeroBanner items={featured} />
                </div>
            )}

            <main className={`container mx-auto px-4 sm:px-6 ${featured.length > 0 ? 'pt-10' : 'pt-24 sm:pt-32 lg:pt-40'}`}>
                {/* Header Section */}
                {!(featured.length > 0 && (categoryId === 'movies' || categoryId === 'series')) && (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16 px-1 lg:px-4">
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4"
                            >
                                <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg" />
                                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-main font-arabic tracking-tight">
                                    {categoryLabel}
                                </h1>
                            </motion.div>
                            <nav className="flex items-center gap-2 text-muted text-[10px] sm:text-sm font-arabic mr-4 sm:mr-6">
                                <Link to="/" className="hover:text-yellow-400 transition">الرئيسية</Link>
                                <span>/</span>
                                <span className="text-yellow-400 font-bold">{categoryLabel}</span>
                            </nav>
                        </div>

                        {/* Stats or Filter */}
                        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-arabic mr-4 md:mr-0">
                            <div className="px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-card border border-white/5 text-muted shadow-xl flex items-center gap-2 sm:gap-3">
                                <div className="flex flex-col items-center border-l border-white/10 pl-2 sm:pl-3 ml-2 sm:ml-3">
                                    <span className="text-yellow-400 font-black text-base sm:text-lg">{moviesCount}</span>
                                    <span>أفلام</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-cyan-400 font-black text-base sm:text-lg">{seriesCount}</span>
                                    <span>مسلسلات</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <div className="flex flex-col gap-6 sm:gap-8 mb-10 sm:mb-12 px-1 lg:px-4">
                    {/* Subcategory Chips (Folders) */}
                    <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2">
                        {[...new Set(allContent.map(item => item.subcategory).filter(Boolean))].map((sub) => (
                            <motion.button
                                key={sub}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveSubcat(activeSubcat === sub ? 'all' : sub)}
                                className={`px-7 sm:px-10 py-3 sm:py-4 rounded-2xl font-arabic text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap border ${activeSubcat === sub
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-transparent shadow-[0_10px_30px_rgba(255,215,0,0.3)]'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 backdrop-blur-md'
                                    }`}
                            >
                                {sub}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8 lg:gap-10">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="aspect-[2/3] rounded-2xl sm:rounded-[2rem] bg-card/50 animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-8 lg:gap-10"
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
