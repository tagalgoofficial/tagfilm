import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AiFillStar, AiFillPlayCircle, AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useFavorites } from '../context/FavoritesContext';
import { useState } from 'react';
import { BiTime, BiMoviePlay } from 'react-icons/bi';

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
        <Link to={linkPath} className="block group/card_link">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className="relative group/card w-full cursor-pointer"
            >
                {/* Main Card Container */}
                <motion.div
                    animate={{
                        y: isHovered ? -10 : 0,
                    }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="relative aspect-[2/3] rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-[#0d0d1f] border border-white/5 group-hover/card:border-yellow-400/40 transition-all duration-500 shadow-2xl"
                >
                    {/* Poster Image */}
                    <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050514] via-[#050514]/20 to-transparent opacity-80" />

                    {/* Hover Overlay - Story & Actions (Desktop Only) */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-30 hidden lg:flex flex-col justify-end p-6 bg-gradient-to-t from-black/95 via-black/80 to-black/20 backdrop-blur-[2px]"
                            >
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-4"
                                >
                                    {/* Overview/Story Preview */}
                                    <div className="space-y-2">
                                        <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest font-arabic">قصة العمل</p>
                                        <p className="text-white/80 text-xs font-arabic leading-relaxed line-clamp-4">
                                            {movie.overview || "لا يوجد وصف متاح لهذا العمل حالياً."}
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                                            <AiFillPlayCircle className="text-2xl" />
                                        </div>
                                        <span className="text-white font-black text-sm font-arabic">مشاهدة الآن</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick Badges (Always Visible) */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                        {movie.quality && (
                            <span className="px-2 py-1 bg-yellow-400 text-black font-black text-[9px] rounded-lg shadow-lg uppercase">
                                {movie.quality}
                            </span>
                        )}
                        {movie.year && (
                            <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-white font-bold text-[9px] rounded-lg border border-white/10">
                                {movie.year}
                            </span>
                        )}
                    </div>

                    {/* Favorite Button */}
                    <div className="absolute top-3 right-3 z-40">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleFavorite}
                            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${isFav
                                ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.5)]'
                                : 'bg-black/40 text-white border-white/10 hover:border-yellow-400/50'
                                }`}
                        >
                            {isFav ? <AiFillHeart className="text-base" /> : <AiOutlineHeart className="text-base" />}
                        </motion.button>
                    </div>

                    {/* Type Icon Overlay (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 ${type === 'series' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-400/20 text-yellow-400'}`}>
                            {type === 'series' ? <BiMoviePlay /> : <AiFillPlayCircle />}
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Info (Always Visible) */}
                <div className="mt-4 px-2">
                    <h3 className="text-white font-black text-sm sm:text-lg mb-1 line-clamp-1 font-arabic group-hover/card:text-yellow-400 transition-colors duration-300">
                        {movie.titleAr || movie.title}
                    </h3>
                    <div className="flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] sm:text-xs font-arabic font-bold text-gray-400">{type === 'series' ? 'مسلسل' : 'فيلم'}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-600" />
                            <span className="text-[10px] sm:text-xs font-bold text-gray-500">{movie.duration || movie.episodesCount || 'N/A'}</span>
                        </div>
                        {movie.rating && (
                            <div className="flex items-center gap-1 text-yellow-400 text-[10px] sm:text-xs">
                                <AiFillStar />
                                <span className="font-bold">{movie.rating}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default MovieCard;
