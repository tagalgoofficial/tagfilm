import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AiFillStar, AiFillPlayCircle, AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { BiDownload, BiTime } from 'react-icons/bi';
import { useFavorites } from '../context/FavoritesContext';
import { IoMdArrowBack } from 'react-icons/io';
import { MdMovieFilter, MdLanguage, MdCalendarToday } from 'react-icons/md';
import Header from '../components/Header';
import VideoPlayer from '../components/VideoPlayer';
import { getMovie } from '../firebase/moviesService';
import { getCategories } from '../firebase/categoriesService';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playerMode, setPlayerMode] = useState(false);
    const [activeServer, setActiveServer] = useState(0);
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(id);

    useEffect(() => {
        const loadData = async () => {
            console.log("MovieDetails: Loading ID:", id);
            setLoading(true);
            try {
                const movieData = await getMovie(id);
                console.log("MovieDetails: Fetched Movie:", movieData);
                setMovie(movieData);

                try {
                    const catsData = await getCategories();
                    setCategories(catsData);
                } catch (catError) {
                    console.error("Error loading categories (non-fatal):", catError);
                }
            } catch (error) {
                console.error("Error loading movie details:", error);
            }
            setLoading(false);
        };
        loadData();
        window.scrollTo(0, 0);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050514] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#050514] flex flex-col items-center justify-center text-white p-6">
                <MdMovieFilter className="text-8xl text-gray-700 mb-4" />
                <h2 className="text-2xl font-bold font-arabic mb-4">الفيلم غير موجود</h2>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl font-arabic">
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    const servers = movie.servers || [];
    const currentLink = servers[activeServer]?.watchLink || movie.watchLink || '';

    const categoryLabel = categories.find(c => c.id === movie.category)?.label || movie.category;
    const subcategoryLabel = movie.subcategory; // Assuming subcategory is stored as name or we keep it as is for now

    return (
        <div className="min-h-screen bg-site text-main transition-colors duration-500" dir="rtl" lang="ar">
            <Header />

            {/* Video Player Section */}
            <AnimatePresence>
                {playerMode && currentLink && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative z-[60] bg-black"
                    >
                        <div className="flex items-center justify-between px-6 py-3 bg-[#0a0a1a] border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setPlayerMode(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                                    <IoMdArrowBack className="text-2xl transform rotate-180" />
                                </button>
                                <div>
                                    <h2 className="text-sm font-bold font-arabic">{movie.titleAr || movie.title}</h2>
                                    <p className="text-xs text-yellow-400 font-arabic">جارٍ التشغيل الآن...</p>
                                </div>
                            </div>
                        </div>
                        <VideoPlayer
                            src={currentLink}
                            poster={movie.backdrop || movie.poster}
                            title={movie.titleAr || movie.title}
                            introEnd={Number(movie.introDuration || 0)}
                        />
                        {/* Server Selection below player */}
                        {servers.length > 1 && (
                            <div className="p-4 flex flex-wrap gap-2 justify-center bg-[#0a0a1a]">
                                {servers.map((srv, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveServer(idx)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeServer === idx ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                    >
                                        سيرفر {idx + 1} ({srv.quality})
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            {!playerMode && (
                <div className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
                    {/* Backdrop */}
                    <div className="absolute inset-0">
                        <img
                            src={movie.backdrop || movie.poster}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-site via-site/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-site via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-site/60 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full container mx-auto px-5 lg:px-16 flex flex-col justify-end lg:justify-center pb-12 lg:pb-32">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-2xl px-1"
                        >
                            {/* Type Badge */}
                            <div className="flex items-center gap-2 mb-4 lg:mb-6">
                                <span className="bg-yellow-400 text-black px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black font-arabic uppercase tracking-wider">
                                    فيلم
                                </span>
                                {movie.isNew && (
                                    <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold font-arabic">
                                        جديد
                                    </span>
                                )}
                            </div>

                            {/* Logo or Title */}
                            {movie.logo ? (
                                <img src={movie.logo} alt={movie.title} className="max-h-24 sm:max-h-40 object-contain mb-6 sm:mb-8 drop-shadow-2xl" />
                            ) : (
                                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black font-arabic mb-6 sm:mb-8 drop-shadow-lg leading-tight">
                                    {movie.titleAr || movie.title}
                                </h1>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-xs sm:text-sm lg:text-base font-bold">
                                <div className="flex items-center gap-1.5 text-yellow-400">
                                    <AiFillStar className="text-lg sm:text-xl" />
                                    <span>{movie.rating}</span>
                                </div>
                                <span className="text-gray-300 font-arabic border-r border-white/20 pr-4 sm:pr-6">
                                    {movie.year}
                                </span>
                                <span className="text-gray-300 font-arabic border-r border-white/20 pr-4 sm:pr-6">
                                    {movie.duration}
                                </span>
                                {movie.quality && (
                                    <span className="bg-white/10 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs border border-white/10 font-black">
                                        {movie.quality}
                                    </span>
                                )}
                            </div>

                            {/* Overview */}
                            <p className="text-gray-200 text-sm sm:text-lg lg:text-xl font-arabic leading-relaxed mb-8 sm:mb-10 line-clamp-3 max-w-2xl">
                                {movie.overview}
                            </p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setPlayerMode(true);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="flex items-center justify-center gap-3 sm:gap-4 px-8 py-4 sm:px-12 sm:py-5 bg-yellow-400 text-black font-black rounded-xl sm:rounded-2xl text-lg sm:text-xl shadow-2xl transition-all font-arabic"
                                >
                                    <AiFillPlayCircle className="text-2xl sm:text-3xl" />
                                    مشاهدة الآن
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, background: isFav ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.15)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleFavorite(movie)}
                                    className={`flex items-center justify-center gap-3 sm:gap-4 px-8 py-4 sm:px-10 sm:py-5 ${isFav ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' : 'bg-white/10 border-white/10 text-white'} backdrop-blur-xl border rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all font-arabic`}
                                >
                                    {isFav ? <AiFillHeart className="text-2xl sm:text-3xl" /> : <AiOutlineHeart className="text-2xl sm:text-3xl" />}
                                    {isFav ? 'في المفضلة' : 'أضف للمفضلة'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
                        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center p-2">
                            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Content Section */}
            <div className="container mx-auto px-6 lg:px-16 py-16">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Details Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Cast Section */}
                        {movie.cast && movie.cast.length > 0 && (
                            <section>
                                <h3 className="text-2xl font-black font-arabic mb-8 flex items-center gap-3 text-yellow-400">
                                    <span className="w-2 h-8 bg-yellow-400 rounded-full" />
                                    طاقم العمل
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {movie.cast.map((actor, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -5 }}
                                            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden text-center group"
                                        >
                                            <div className="aspect-[3/4] overflow-hidden">
                                                <img
                                                    src={actor.photo || 'https://via.placeholder.com/200x300'}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-3">
                                                <p className="font-bold text-sm font-arabic truncate text-white">{actor.name}</p>
                                                <p className="text-xs text-gray-500 font-arabic truncate mt-1">{actor.character}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Meta Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl sticky top-32">
                            <h3 className="text-2xl font-black font-arabic mb-8 text-yellow-400">معلومات الفيلم</h3>

                            <div className="space-y-6">
                                <InfoItem icon={MdLanguage} label="اللغة" value={movie.language || 'العربية'} />
                                <InfoItem icon={MdCalendarToday} label="سنة الإصدار" value={movie.year} />
                                <InfoItem icon={BiTime} label="المدة" value={movie.duration} />
                                <InfoItem icon={MdMovieFilter} label="التصنيف" value={categoryLabel} />
                                {subcategoryLabel && <InfoItem icon={MdMovieFilter} label="التصنيف الفرعي" value={subcategoryLabel} />}
                                {movie.country && <InfoItem icon={MdLanguage} label="بلد المنشأ" value={movie.country} />}
                            </div>

                            {/* External Links or Share could go here */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
            <Icon className="text-xl text-yellow-400" />
        </div>
        <div>
            <p className="text-gray-500 text-xs font-arabic mb-0.5">{label}</p>
            <p className="text-white font-bold font-arabic">{value}</p>
        </div>
    </div>
);

export default MovieDetails;
