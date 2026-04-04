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
import Carousel from '../components/Carousel';

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
    const [movieCategories, setMovieCategories] = useState([]);
    const [seriesSubcategories, setSeriesSubcategories] = useState([]);
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
                    // Find the 7 movie specific categories
                    const mCats = cats.filter(c => c.icon === 'movies').sort((a, b) => (a.order || 0) - (b.order || 0));
                    setMovieCategories(mCats);

                    moviesFiltered = movies.map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = [];
                } else if (categoryId === 'series') {
                    cat = { id: 'series', label: 'جميع المسلسلات' };
                    // Find actual "Series" category to get its subcategories
                    const sCat = cats.find(c => c.icon === 'series');
                    if (sCat) {
                        setSeriesSubcategories(sCat.subcategories || []);
                    }
                    seriesFiltered = series.map(s => ({ ...s, _type: 'series' }));
                    moviesFiltered = [];
                } else if (categoryId === 'tv-shows') {
                    // Find actual category in DB that represents TV Shows
                    cat = cats.find(c => c.labelEn === 'Others' || c.label === 'أخرى' || c.icon === 'other') || { label: 'البرامج التلفزيونية' };
                    const isInCategory = (item, catId) => item.category === catId || (item.categories && item.categories.includes(catId));
                    moviesFiltered = movies.filter(m => isInCategory(m, cat.id) && m.subcategory === 'برامج').map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series.filter(s => isInCategory(s, cat.id) && s.subcategory === 'برامج').map(s => ({ ...s, _type: 'series' }));
                } else if (categoryId === 'kids') {
                    cat = cats.find(c => c.labelEn === 'Others' || c.label === 'أخرى' || c.icon === 'other') || { label: 'أطفال' };
                    const isInCategory = (item, catId) => item.category === catId || (item.categories && item.categories.includes(catId));
                    moviesFiltered = movies.filter(m => isInCategory(m, cat.id) && m.subcategory === 'أطفال').map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series.filter(s => isInCategory(s, cat.id) && s.subcategory === 'أطفال').map(s => ({ ...s, _type: 'series' }));
                } else if (categoryId === 'ramadan') {
                    cat = cats.find(c => c.icon === 'ramadan') || { label: 'رمضان' };
                    const isInCategory = (item, catId) => item.category === catId || (item.categories && item.categories.includes(catId));
                    moviesFiltered = movies.filter(m => isInCategory(m, cat.id)).map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series.filter(s => isInCategory(s, cat.id)).map(s => ({ ...s, _type: 'series' }));
                } else {
                    cat = cats.find(c => c.id === categoryId);
                    const isInCategory = (item, catId) => item.category === catId || (item.categories && item.categories.includes(catId));
                    moviesFiltered = movies
                        .filter(m => isInCategory(m, categoryId))
                        .map(m => ({ ...m, _type: 'movie' }));
                    seriesFiltered = series
                        .filter(s => isInCategory(s, categoryId))
                        .map(s => ({ ...s, _type: 'series' }));
                }

                setCategory(cat);
                const combined = [...moviesFiltered, ...seriesFiltered].sort((a, b) => {
                    const yearA = parseInt(a.year) || 0;
                    const yearB = parseInt(b.year) || 0;
                    return yearB - yearA;
                });
                setAllContent(combined);
                setFiltered(combined);

                // جلب المحتوى المميز الخاص بهذا التصنيف تحديداً
                // نسخدم slug الرابط للأقسام الخاصة، والـ ID للأقسام العادية
                // نأخذ في الاعتبار التصنيف الفرعي إذا وجد
                const specialSlugs = ['movies', 'series', 'ramadan', 'kids', 'tv-shows'];
                const activeSub = activeSubcat !== 'all' ? activeSubcat : (subcategory ? decodeURIComponent(subcategory) : 'all');
                const parentFeatId = specialSlugs.includes(categoryId) ? categoryId : (cat?.id || categoryId);
                let featId = parentFeatId;

                if (activeSub !== 'all') {
                    // Use isolated ID for subcategories (parentID_subName)
                    featId = `${categoryId}_${activeSub}`;
                }

                let feat = await getFeatured(featId);

                // Fallback to parent category if subcategory banner is empty
                if (feat.length === 0 && featId !== parentFeatId) {
                    feat = await getFeatured(parentFeatId);
                }

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
    }, [categoryId, subcategory]);
    // Added subcategory to dependencies to re-trigger load (especially for Hero Banner)

    useEffect(() => {
        let result = [...allContent];

        if (contentType === 'movies') result = result.filter(i => i._type === 'movie');
        if (contentType === 'series') result = result.filter(i => i._type === 'series');

        if (activeSubcat !== 'all') {
            result = result.filter(i =>
                (i.subcategories && i.subcategories.includes(activeSubcat)) ||
                i.subcategory === activeSubcat
            );
        }

        if (activeCategoryFilter !== 'all') {
            result = result.filter(i => i.category === activeCategoryFilter || (i.categories && i.categories.includes(activeCategoryFilter)));
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(i =>
                i.titleAr?.includes(q) ||
                i.title?.toLowerCase().includes(q)
            );
        }

        setFiltered(result);
    }, [search, activeSubcat, contentType, allContent, activeCategoryFilter, subcategory]);

    useEffect(() => {
        if (subcategory) {
            setActiveSubcat(decodeURIComponent(subcategory));
        } else {
            setActiveSubcat('all');
        }
    }, [subcategory]);

    const filteredMoviesCount = filtered.filter(i => i._type === 'movie').length;
    const filteredSeriesCount = filtered.filter(i => i._type === 'series').length;

    const categoryLabel = activeSubcat !== 'all' ? activeSubcat : (category?.label || 'التصنيف');

    const scrollToId = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const headerOffset = 100;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveSubcat(id);
        }
    };

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
                {!(featured.length > 0) && (
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16 px-1 lg:px-4">
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="flex flex-col gap-1"
                            >
                                <div className="flex items-center gap-3 sm:gap-4 mb-1">
                                    <div className="w-1.5 h-8 sm:w-2 sm:h-10 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg" />
                                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-main font-arabic tracking-tight">
                                        {categoryLabel}
                                    </h1>
                                </div>
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '120px' }}
                                    transition={{ duration: 1, delay: 0.2 }}
                                    className="h-1.5 bg-white rounded-full mr-4 sm:mr-6 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                />
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
                                {filteredMoviesCount > 0 && (
                                    <div className="flex flex-col items-center border-l border-white/10 pl-2 sm:pl-3 ml-2 sm:ml-3">
                                        <span className="text-yellow-400 font-black text-base sm:text-lg">{filteredMoviesCount}</span>
                                        <span>أفلام</span>
                                    </div>
                                )}
                                {filteredSeriesCount > 0 && (
                                    <div className="flex flex-col items-center">
                                        <span className="text-cyan-400 font-black text-base sm:text-lg">{filteredSeriesCount}</span>
                                        <span>مسلسلات</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subcategory Chips (Folders) / Section Nav */}

                {/* Content Grid */}
                {
                    loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8 lg:gap-10">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                <div key={i} className="aspect-[2/3] rounded-2xl sm:rounded-[2rem] bg-card/50 animate-pulse border border-white/5" />
                            ))}
                        </div>
                    ) : (categoryId === 'movies' || categoryId === 'series') && activeSubcat === 'all' ? (
                        <div className="space-y-12 pb-20">
                            {categoryId === 'movies' ? (
                                movieCategories.map((mCat) => {
                                    const catMovies = filtered.filter(m => m.category === mCat.id || (m.categories && m.categories.includes(mCat.id)));
                                    if (catMovies.length === 0) return null;
                                    return (
                                        <div key={mCat.id} id={mCat.id}>
                                            <Carousel
                                                title={mCat.label}
                                                titleAr={mCat.labelEn}
                                                movies={catMovies}
                                                link={`/category/${mCat.id}`}
                                            />
                                        </div>
                                    );
                                })
                            ) : (
                                seriesSubcategories.map((sub) => {
                                    const subSeries = filtered.filter(s =>
                                        s.subcategory === sub.name || (s.subcategories && s.subcategories.includes(sub.name))
                                    );
                                    if (subSeries.length === 0) return null;
                                    return (
                                        <div key={sub.id} id={sub.id}>
                                            <Carousel
                                                title={sub.name}
                                                movies={subSeries}
                                                link={`/category/series/${encodeURIComponent(sub.name)}`}
                                            />
                                        </div>
                                    );
                                })
                            )}
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
                    )
                }
            </main >
        </div >
    );
};

export default CategoryPage;
