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
import Skeleton from '../components/Skeleton';

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playerMode, setPlayerMode] = useState(false);
    const [activeServer, setActiveServer] = useState(0);
    const [selectedPart, setSelectedPart] = useState(null); // null means main movie
    const [resolvedUrl, setResolvedUrl] = useState('');
    const [fetchingStream, setFetchingStream] = useState(false);
    const [showTrailer, setShowTrailer] = useState(false);
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
        setSelectedPart(null);
        setActiveServer(0);
        window.scrollTo(0, 0);
    }, [id]);

    const currentMovie = selectedPart || movie;
    const servers = currentMovie?.servers || [];
    const currentLink = servers[activeServer]?.watchLink || currentMovie?.watchLink || '';

    // Resolve TagAlgo URLs
    useEffect(() => {
        const resolveUrl = async () => {
            if (!currentLink) {
                setResolvedUrl('');
                return;
            }

            const isApiPlay = currentLink.includes('api.tagalgo.com/api/play/');
            const isRawStreaming = currentLink.includes('streaming.tagalgo.com/videos/');

            if (isApiPlay || isRawStreaming) {
                setFetchingStream(true);
                try {
                    let targetPlayUrl = currentLink;

                    if (isRawStreaming && !isApiPlay) {
                        const pathMatch = currentLink.match(/streaming\.tagalgo\.com\/videos\/(.+)/);
                        if (pathMatch) {
                            let relativePath = pathMatch[1].replace('/index.m3u8', '');
                            targetPlayUrl = `https://api.tagalgo.com/api/play/${relativePath}`;
                        }
                    }

                    const response = await fetch(targetPlayUrl, { credentials: 'include' });
                    if (!response.ok) throw new Error('فشل جلب رابط البث');
                    const data = await response.json();
                    setResolvedUrl(data.secureUrl);
                } catch (err) {
                    console.error("Error fetching secure URL:", err);
                    setResolvedUrl(currentLink);
                }
                setFetchingStream(false);
            } else {
                setResolvedUrl(currentLink);
            }
        };
        resolveUrl();
    }, [currentLink]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050514]" dir="rtl">
                <Header />
                <div className="relative h-[60vh] w-full">
                    <Skeleton className="w-full h-full" />
                    <div className="absolute inset-x-0 bottom-0 p-8 md:p-12 space-y-4">
                        <Skeleton variant="text" className="w-64 h-12" />
                        <div className="flex gap-4">
                            <Skeleton variant="text" className="w-24 h-4" />
                            <Skeleton variant="text" className="w-24 h-4" />
                            <Skeleton variant="text" className="w-24 h-4" />
                        </div>
                    </div>
                </div>
                <div className="p-8 md:p-12">
                    <Skeleton variant="text" className="w-full h-4 mb-2" />
                    <Skeleton variant="text" className="w-full h-4 mb-2" />
                    <Skeleton variant="text" className="w-3/4 h-4" />
                </div>
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

    const movieCategories = movie.categories || (movie.category ? [movie.category] : []);
    const categoryLabel = movieCategories.map(catId => categories.find(c => c.id === catId)?.label || catId).join(' ، ') || 'بدون تصنيف';
    const subcategoryLabel = movie.subcategory;

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
                                <button onClick={() => setPlayerMode(false)} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                                    <IoMdArrowBack className="text-2xl" />
                                </button>
                                <div>
                                    <h2 className="text-sm font-bold font-arabic">{movie.titleAr || movie.title}</h2>
                                    {selectedPart && <p className="text-xs text-yellow-400 font-arabic">{selectedPart.title}</p>}
                                </div>
                            </div>
                        </div>

                        {fetchingStream ? (
                            <div className="aspect-video bg-black flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-white font-arabic text-sm">جاري تجهيز البث الآمن...</p>
                            </div>
                        ) : (
                            <VideoPlayer
                                key={resolvedUrl}
                                src={resolvedUrl}
                                poster={movie.backdrop || movie.poster}
                                title={movie.titleAr || movie.title}
                                introEnd={Number(movie.introDuration || 0)}
                                mediaId={id}
                                mediaType="movie"
                            />
                        )}
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
                    <div className="relative z-10 h-full container mx-auto px-5 lg:px-16 flex flex-col justify-center pt-60 sm:pt-72 pb-12 lg:pb-32">
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
                                    <AiFillStar className="text-lg sm:text-lg" />
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
                                {movie.subcategories && movie.subcategories.length > 0 && (
                                    <span className="bg-white/10 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs border border-white/10 font-black truncate max-w-[200px] font-arabic text-cyan-300">
                                        {movie.subcategories.join('، ')}
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
                                    <AiFillPlayCircle className="text-2xl sm:text-2xl" />
                                    مشاهدة الآن
                                </motion.button>

                                {movie.trailer && (
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 0, 0, 0.3)' }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowTrailer(true)}
                                        className="flex items-center justify-center gap-3 sm:gap-4 px-8 py-4 sm:px-10 sm:py-5 bg-red-600/10 border border-red-600/30 text-red-500 font-black rounded-xl sm:rounded-2xl text-lg sm:text-xl shadow-2xl transition-all font-arabic"
                                    >
                                        <AiFillPlayCircle className="text-2xl sm:text-2xl text-red-500" />
                                        التريلر
                                    </motion.button>
                                )}

                                {(() => {
                                    const dlServer = movie.servers?.find(s => s.downloadLink) || movie.servers?.[0];
                                    const dlLink = dlServer?.downloadLink || movie.downloadLink;
                                    if (!dlLink) return null;
                                    return (
                                        <motion.a
                                            href={dlLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0, 212, 255, 0.3)' }}
                                            whileTap={{ scale: 0.95 }}
                                            className="flex items-center justify-center gap-3 sm:gap-4 px-8 py-4 sm:px-10 sm:py-5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black rounded-xl sm:rounded-2xl text-lg sm:text-xl shadow-2xl transition-all font-arabic"
                                        >
                                            <BiDownload className="text-2xl sm:text-2xl" />
                                            تحميل
                                        </motion.a>
                                    );
                                })()}

                                <motion.button
                                    whileHover={{ scale: 1.05, background: isFav ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.15)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleFavorite(movie)}
                                    className={`flex items-center justify-center gap-3 sm:gap-4 px-8 py-4 sm:px-10 sm:py-5 ${isFav ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' : 'bg-white/10 border-white/10 text-white'} backdrop-blur-xl border rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl transition-all font-arabic`}
                                >
                                    {isFav ? <AiFillHeart className="text-2xl sm:text-2xl" /> : <AiOutlineHeart className="text-2xl sm:text-2xl" />}
                                    {isFav ? 'في المفضلة' : 'أضف للمفضلة'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
                        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1.5">
                            <div className="w-1 h-2 bg-white/40 rounded-full" />
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
                        {/* Parts Section */}
                        {movie.parts && movie.parts.length > 0 && (
                            <section className="bg-white/5 p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-xl">
                                <h3 className="text-2xl font-black font-arabic mb-8 flex items-center gap-3 text-yellow-400">
                                    <span className="w-2 h-8 bg-yellow-400 rounded-full" />
                                    أجزاء السلسلة
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Main Movie as Part 1 */}
                                    <div className="group/part relative">
                                        <button
                                            onClick={() => { setSelectedPart(null); setActiveServer(0); setPlayerMode(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedPart === null ? 'bg-yellow-400 border-transparent shadow-[0_0_30px_rgba(255,215,0,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                <img src={movie.poster} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="text-right flex-1">
                                                <p className={`font-black font-arabic text-sm ${selectedPart === null ? 'text-black' : 'text-white'}`}>الجزء الأول</p>
                                                <p className={`text-xs font-arabic mt-1 ${selectedPart === null ? 'text-black/60' : 'text-gray-400'}`}>{movie.titleAr || movie.title}</p>
                                            </div>
                                        </button>

                                        {/* Download button for main movie */}
                                        {(() => {
                                            const dlServer = movie.servers?.find(s => s.downloadLink) || movie.servers?.[0];
                                            const dlLink = dlServer?.downloadLink || movie.downloadLink || dlServer?.watchLink || movie.watchLink;

                                            if (!dlLink) return null;
                                            return (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); window.location.href = dlLink; }}
                                                    className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 font-arabic font-bold text-[10px] ${selectedPart === null ? 'bg-black/20 text-black hover:bg-black/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black'}`}
                                                    title="تحميل مباشر للجزء الأول"
                                                >
                                                    <BiDownload className="text-base" />
                                                    <span>تحميل</span>
                                                </button>
                                            );
                                        })()}
                                    </div>

                                    {/* Other Parts */}
                                    {movie.parts.sort((a, b) => a.partNumber - b.partNumber).map((part, idx) => (
                                        <div key={part.id} className="group/part relative">
                                            <button
                                                onClick={() => { setSelectedPart(part); setActiveServer(0); setPlayerMode(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${selectedPart?.id === part.id ? 'bg-yellow-400 border-transparent shadow-[0_0_30px_rgba(255,215,0,0.2)]' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                            >
                                                <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                                    <img src={part.poster || movie.poster} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="text-right flex-1">
                                                    <p className={`font-black font-arabic text-sm ${selectedPart?.id === part.id ? 'text-black' : 'text-white'}`}>الجزء {part.partNumber}</p>
                                                    <p className={`text-xs font-arabic mt-1 ${selectedPart?.id === part.id ? 'text-black/60' : 'text-gray-400'}`}>{part.name || 'بدون اسم'}</p>
                                                </div>
                                            </button>

                                            {/* Download button for part */}
                                            {(() => {
                                                const pDlServer = part.servers?.find(s => s.downloadLink) || part.servers?.[0];
                                                const pDlLink = pDlServer?.downloadLink || part.downloadLink || pDlServer?.watchLink || part.watchLink;

                                                if (!pDlLink) return null;
                                                return (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); window.location.href = pDlLink; }}
                                                        className={`absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300 font-arabic font-bold text-[10px] ${selectedPart?.id === part.id ? 'bg-black/20 text-black hover:bg-black/30' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black'}`}
                                                        title={`تحميل مباشر للجزء ${part.partNumber}`}
                                                    >
                                                        <BiDownload className="text-base" />
                                                        <span>تحميل</span>
                                                    </button>
                                                );
                                            })()}
                                        </div>
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
                                {movie.genres && movie.genres.length > 0 && (
                                    <InfoItem icon={MdMovieFilter} label="الأنواع" value={movie.genres.join(' ، ')} />
                                )}
                                {movie.country && <InfoItem icon={MdLanguage} label="بلد المنشأ" value={movie.country} />}
                            </div>

                            {/* External Links or Share could go here */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trailer Modal */}
            <AnimatePresence>
                {showTrailer && movie.trailer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setShowTrailer(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowTrailer(false)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-black/50 text-white hover:bg-white/10 transition backdrop-blur-md"
                            >
                                <MdMovieFilter className="rotate-45" /> {/* Use close icon if available, but let's use IoMdArrowBack or similar */}
                                <span className="absolute">✕</span>
                            </button>

                            <iframe
                                src={`https://www.youtube.com/embed/${movie.trailer.split('v=')[1]}?autoplay=1`}
                                title="Trailer"
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
