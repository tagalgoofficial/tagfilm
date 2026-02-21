import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AiFillStar, AiFillPlayCircle, AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useFavorites } from '../context/FavoritesContext';
import { useState } from 'react';

const Fanous = ({ side }) => (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.8 }}
        className={`absolute bottom-16 ${side === 'left' ? '-left-4' : '-right-4'} z-40 w-10 h-14 pointer-events-none`}
    >
        <svg viewBox="0 0 60 90" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]">
            <path d="M30 0 L10 20 L10 70 L30 90 L50 70 L50 20 Z" fill="url(#fanousGrad)" stroke="#ff8c00" strokeWidth="1.5" />
            <rect x="20" y="25" width="20" height="40" rx="2" fill="rgba(255,255,255,0.2)" />
            <circle cx="30" cy="45" r="8" fill="rgba(255,215,0,0.9)" className="animate-pulse" />
            <defs>
                <linearGradient id="fanousGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ffd700' }} />
                    <stop offset="100%" style={{ stopColor: '#ff8c00' }} />
                </linearGradient>
            </defs>
        </svg>
    </motion.div>
);

const Zina = () => (
    <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="absolute top-0 left-0 right-0 z-40 flex justify-around px-2 pointer-events-none"
    >
        {[...Array(4)].map((_, i) => (
            <motion.div
                key={i}
                animate={{ y: [0, 2, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                className="w-4 h-8 bg-gradient-to-b from-yellow-400 to-transparent rounded-b-full shadow-[0_0_10px_rgba(255,215,0,0.4)] border-x border-orange-500/20"
            >
                <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1 animate-pulse" />
            </motion.div>
        ))}
    </motion.div>
);

const MovieCard = ({ movie }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(movie.id);

    const type = movie.type || movie._type || (movie.seasons ? 'series' : 'movie');
    const linkPath = type === 'series' ? `/series/${movie.id}` : `/movie/${movie.id}`;

    const handleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(movie);
    };

    return (
        <Link to={linkPath} className="block">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group/card w-full cursor-pointer p-1 sm:p-2"
            >
                {/* Ramadan Decorations */}
                <AnimatePresence>
                    {isHovered && (
                        <>
                            <Zina />
                            <Fanous side="left" />
                            <Fanous side="right" />
                        </>
                    )}
                </AnimatePresence>

                {/* Card Container */}
                <motion.div
                    animate={{
                        scale: isHovered ? 1.05 : 1,
                        boxShadow: isHovered ? "0 0 40px rgba(255, 215, 0, 0.35)" : "var(--shadow-premium)"
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative rounded-[2rem] overflow-hidden bg-card border border-white/5 group-hover/card:border-yellow-400/50 transition-all duration-500 shadow-2xl"
                >
                    {/* Inner Glow Effect */}
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_60px_rgba(255,215,0,0.25)] border-2 border-yellow-400/20 rounded-2xl"
                        />
                    )}

                    {/* Poster Image */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                        />

                        {/* Premium Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-site via-transparent to-transparent opacity-90" />
                        <div className={`absolute inset-0 bg-gradient-to-t from-yellow-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`} />

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                            {movie.isComingSoon ? (
                                <span className="px-3 py-1.5 bg-yellow-400 text-black font-black text-[12px] rounded-lg shadow-[0_0_15px_rgba(255,215,0,0.5)] animate-pulse border border-black/10">
                                    قريباً
                                </span>
                            ) : (
                                <>
                                    {movie.quality && (
                                        <span className="px-2.5 py-1 bg-yellow-400 text-black font-black text-[10px] rounded-lg shadow-lg">
                                            {movie.quality}
                                        </span>
                                    )}
                                    {movie.year && (
                                        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] rounded-lg border border-white/10 uppercase tracking-wider">
                                            {movie.year}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Favorite Button */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleFavorite}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${isFav
                                    ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.5)]'
                                    : 'bg-black/40 text-white border-white/20 hover:border-yellow-400/50'
                                    } ${isHovered ? 'opacity-100' : 'opacity-100 sm:opacity-0'}`}
                            >
                                {isFav ? <AiFillHeart className="text-lg sm:text-xl" /> : <AiOutlineHeart className="text-lg sm:text-xl" />}
                            </motion.button>
                        </div>

                        {/* Hover Actions (Desktop Only Overlay) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            className="absolute inset-0 z-30 hidden lg:flex flex-col items-center justify-center gap-4 bg-black/40 backdrop-blur-[2px]"
                        >
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col items-center gap-3 w-full px-8"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(255,215,0,0.6)] group-hover/card:scale-110 transition-transform ${movie.isComingSoon ? 'bg-gray-400 text-gray-900 shadow-none grayscale' : 'bg-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.6)]'}`}>
                                    <AiFillPlayCircle className="text-4xl" />
                                </div>
                                <span className="text-white font-black text-lg font-arabic tracking-wide drop-shadow-md">
                                    {movie.isComingSoon ? 'قريباً' : 'شاهد الآن'}
                                </span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Content Info */}
                    <div className="relative p-4 sm:p-7 z-20">
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        <h3 className="relative text-main font-black text-sm sm:text-xl mb-1 sm:mb-3 line-clamp-1 font-arabic group-hover/card:text-yellow-400 transition-colors duration-300">
                            {movie.titleAr || movie.title}
                        </h3>
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${type === 'series' ? 'bg-cyan-400' : 'bg-yellow-400'}`} />
                                <span className="text-muted text-[10px] sm:text-xs font-arabic font-bold uppercase tracking-widest">{type === 'series' ? 'مسلسل' : 'فيلم'}</span>
                            </div>
                            {movie.rating && (
                                <div className="flex items-center gap-1 text-yellow-400 text-[10px] sm:text-xs">
                                    <AiFillStar />
                                    <span>{movie.rating}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </Link>
    );
};

export default MovieCard;
