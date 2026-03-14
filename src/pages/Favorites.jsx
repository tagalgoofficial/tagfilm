import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import { useFavorites } from '../context/FavoritesContext';
import { Link } from 'react-router-dom';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { MdExplore, MdGridView, MdViewList, MdDelete } from 'react-icons/md';
import { BsCollectionPlay } from 'react-icons/bs';

const Favorites = () => {
    const { favorites, toggleFavorite } = useFavorites();
    const [view, setView] = useState('grid'); // 'grid' | 'list'
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="min-h-screen pb-24 bg-[#050514]" dir="rtl">
            <Header />

            {/* Hero Banner */}
            <div className="relative overflow-hidden">
                {/* Background blur layers */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-[#050514]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050514] via-transparent to-[#050514]" />

                {/* Floating poster collage blurred in background */}
                {favorites.length > 0 && (
                    <div className="absolute inset-0 opacity-10 flex gap-2 overflow-hidden">
                        {favorites.slice(0, 8).map((item, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-40 h-full"
                                style={{ transform: `rotate(${(i % 2 === 0 ? 3 : -3)}deg) translateY(${i % 2 === 0 ? '-5%' : '5%'})` }}
                            >
                                <img src={item.poster} alt="" className="w-full h-full object-cover blur-[2px]" />
                            </div>
                        ))}
                    </div>
                )}

                <div className="relative container mx-auto px-6 pt-36 pb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Icon */}
                        <div className="inline-flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                                <AiFillHeart className="text-black text-xl" />
                            </div>
                            <span className="text-yellow-400 text-xs font-black font-arabic uppercase tracking-[0.2em] opacity-80">قائمة المشاهدة</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black text-white font-arabic tracking-tight mb-3 leading-tight">
                            قائمتي
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"> المفضلة</span>
                        </h1>

                        <p className="text-gray-400 font-arabic text-base max-w-xl leading-relaxed">
                            كل ما قمت بحفظه في مكان واحد — استمتع بمشاهدة أفلامك ومسلسلاتك المفضلة في أي وقت.
                        </p>

                        {/* Stats row */}
                        {favorites.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-6 mt-8"
                            >
                                <div className="flex items-center gap-2">
                                    <BsCollectionPlay className="text-yellow-400 text-xl" />
                                    <span className="text-white font-black text-2xl">{favorites.length}</span>
                                    <span className="text-gray-400 font-arabic text-sm">عنصر محفوظ</span>
                                </div>
                                <div className="w-px h-6 bg-white/10" />
                                {/* View Toggle */}
                                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-sm">
                                    <button
                                        onClick={() => setView('grid')}
                                        className={`p-2 rounded-lg transition-all ${view === 'grid' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <MdGridView className="text-lg" />
                                    </button>
                                    <button
                                        onClick={() => setView('list')}
                                        className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-yellow-400 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        <MdViewList className="text-lg" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </div>

            <main className="container mx-auto px-6">

                <AnimatePresence mode="popLayout">
                    {favorites.length > 0 ? (
                        <motion.div
                            key="content"
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                <span className="text-gray-600 text-xs font-arabic tracking-wider">المحفوظات</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            </div>

                            {/* Grid View */}
                            {view === 'grid' && (
                                <motion.div
                                    layout
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                                >
                                    {favorites.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.85, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                            transition={{ duration: 0.35, delay: index * 0.04 }}
                                            onHoverStart={() => setHoveredId(item.id)}
                                            onHoverEnd={() => setHoveredId(null)}
                                            className="relative group"
                                        >
                                            <MovieCard movie={item} />

                                            {/* Remove button overlay */}
                                            <AnimatePresence>
                                                {hoveredId === item.id && (
                                                    <motion.button
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(item); }}
                                                        className="absolute top-2 left-2 z-30 w-8 h-8 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors"
                                                        title="إزالة من المفضلة"
                                                    >
                                                        <MdDelete className="text-white text-sm" />
                                                    </motion.button>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}

                            {/* List View */}
                            {view === 'list' && (
                                <motion.div layout className="flex flex-col gap-3">
                                    {favorites.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, delay: index * 0.04 }}
                                            className="group relative flex items-center gap-5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-yellow-400/20 rounded-2xl p-4 transition-all duration-300 cursor-pointer"
                                        >
                                            {/* Number */}
                                            <span className="text-gray-700 font-black text-lg w-6 text-center flex-shrink-0 group-hover:text-yellow-400/50 transition-colors">{index + 1}</span>

                                            {/* Poster */}
                                            <Link to={`/movie/${item.id}`} className="flex-shrink-0">
                                                <div className="w-16 h-24 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 shadow-lg">
                                                    <img
                                                        src={item.poster}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    />
                                                </div>
                                            </Link>

                                            {/* Info */}
                                            <Link to={`/movie/${item.id}`} className="flex-1 min-w-0">
                                                <h3 className="text-white font-black font-arabic text-base truncate group-hover:text-yellow-400 transition-colors">
                                                    {item.titleAr || item.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    {item.year && <span className="text-gray-500 text-xs font-arabic">{item.year}</span>}
                                                    {item.rating && (
                                                        <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                                                            ⭐ {item.rating}
                                                        </span>
                                                    )}
                                                    {item.duration && <span className="text-gray-600 text-xs font-arabic">{item.duration}</span>}
                                                    {item.quality && (
                                                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px] font-bold text-gray-400">
                                                            {item.quality}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.overview && (
                                                    <p className="text-gray-600 text-xs font-arabic mt-2 line-clamp-1">{item.overview}</p>
                                                )}
                                            </Link>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <Link to={`/movie/${item.id}`}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="px-4 py-2 bg-yellow-400 text-black font-bold font-arabic rounded-xl text-xs shadow-lg hover:bg-yellow-300 transition-colors"
                                                    >
                                                        مشاهدة
                                                    </motion.button>
                                                </Link>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => toggleFavorite(item)}
                                                    className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                                                >
                                                    <AiFillHeart className="text-red-400 text-base" />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        /* Empty State */
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            {/* Animated heart icon */}
                            <motion.div
                                animate={{ scale: [1, 1.15, 1] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative mb-8"
                            >
                                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-yellow-400/10 to-orange-500/10 border border-yellow-400/20 flex items-center justify-center shadow-[0_0_60px_rgba(255,215,0,0.1)]">
                                    <AiOutlineHeart className="text-6xl text-yellow-400/50" />
                                </div>
                                <div className="absolute inset-0 rounded-[2.5rem] bg-yellow-400/5 blur-xl" />
                            </motion.div>

                            <h2 className="text-3xl font-black text-white font-arabic mb-3">قائمتك فارغة</h2>
                            <p className="text-gray-500 max-w-sm font-arabic text-base leading-relaxed mb-10">
                                لم تقم بإضافة أي محتوى لمفضلتك بعد. اضغط على قلب أي فيلم أو مسلسل لإضافته هنا!
                            </p>

                            <Link to="/">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,215,0,0.3)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-10 py-4 rounded-2xl font-black font-arabic text-base shadow-xl"
                                >
                                    <MdExplore className="text-2xl" />
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
