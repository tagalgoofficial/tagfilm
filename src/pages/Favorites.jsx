import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../context/FavoritesContext';
import { MdBookmark, MdExplore } from 'react-icons/md';
import { Link } from 'react-router-dom';

const Favorites = () => {
    const { favorites } = useFavorites();

    return (
        <div className="min-h-screen pb-20 transition-colors duration-500" style={{ background: 'var(--bg-site)' }} dir="rtl">
            <Header />

            <main className="container mx-auto px-6 pt-32 lg:pt-40">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 mb-3"
                        >
                            <div className="w-2 h-10 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full shadow-lg" />
                            <h1 className="text-4xl lg:text-5xl font-black text-main font-arabic tracking-tight">قائمتي المفضلة</h1>
                        </motion.div>
                        <p className="text-muted font-arabic mr-6">أفلامك ومسلسلاتك التي قمت بحفظها لمشاهدتها لاحقاً</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-arabic mr-6 md:mr-0">
                        <div className="px-5 py-2.5 rounded-2xl bg-card border border-white/5 text-muted shadow-xl">
                            <span className="text-yellow-400 font-black ml-1">{favorites.length}</span>
                            عنصر محفوظ
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="popLayout">
                    {favorites.length > 0 ? (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8"
                        >
                            {favorites.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <MovieCard movie={item} />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                                <MdBookmark className="text-5xl text-gray-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2 font-arabic">قائمة فارغة</h2>
                            <p className="text-gray-500 max-w-xs font-arabic mb-8">لم تقم بإضافة أي شيء لمفضلتك بعد. ابدأ باستكشاف المحتوى وأضف ما يعجبك!</p>

                            <Link to="/">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-yellow-400 text-black px-8 py-3 rounded-xl font-bold font-arabic shadow-lg"
                                >
                                    <MdExplore className="text-xl" />
                                    استكشاف المحتوى
                                </motion.button>
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Favorites;
