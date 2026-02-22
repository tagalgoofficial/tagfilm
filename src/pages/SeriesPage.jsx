import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdStar, MdPlayCircle, MdDownload, MdTv, MdClose,
    MdCalendarToday, MdLanguage, MdMovieFilter, MdFavorite, MdFavoriteBorder
} from 'react-icons/md';
import { useFavorites } from '../context/FavoritesContext';
import { BiTime, BiChevronDown } from 'react-icons/bi';
import { IoMdArrowBack } from 'react-icons/io';
import Header from '../components/Header';
import VideoPlayer from '../components/VideoPlayer';
import { getSeriesById } from '../firebase/seriesService';
import { getCategories } from '../firebase/categoriesService';

const SeriesPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [series, setSeries] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSeason, setActiveSeason] = useState(0);
    const [activeEpisode, setActiveEpisode] = useState(null);
    const [activeServer, setActiveServer] = useState(0);
    const [playerMode, setPlayerMode] = useState(false);
    const { toggleFavorite, isFavorite } = useFavorites();
    const isFav = isFavorite(id);

    useEffect(() => {
        const load = async () => {
            console.log("SeriesPage: Loading ID:", id);
            setLoading(true);
            try {
                const found = await getSeriesById(id);
                console.log("SeriesPage: Fetched Series:", found);
                setSeries(found);

                try {
                    const catsData = await getCategories();
                    setCategories(catsData);
                } catch (catError) {
                    console.error("Error loading categories (non-fatal):", catError);
                }
            } catch (err) {
                console.error("Error loading series details:", err);
            }
            setLoading(false);
        };
        load();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (series && series.seasons?.length > 0) {
            const firstSeason = series.seasons[0];
            if (firstSeason.episodes?.length > 0) {
                setActiveEpisode(firstSeason.episodes[0]);
            }
        }
    }, [series]);

    const currentSeason = series?.seasons?.[activeSeason];
    const episodes = currentSeason?.episodes || [];
    const servers = activeEpisode?.servers || [];
    const legacyLink = activeEpisode?.watchLink;
    const currentLink = servers[activeServer]?.watchLink || legacyLink || '';

    const introEnd = Number(
        activeEpisode?.introEnd ||
        activeEpisode?.introDuration ||
        series?.introDuration ||
        0
    );

    const handleEpisodeClick = (ep) => {
        setActiveEpisode(ep);
        setActiveServer(0);
        setPlayerMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050514] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!series) {
        return (
            <div className="min-h-screen bg-[#050514] flex flex-col items-center justify-center text-white">
                <MdTv className="text-8xl text-gray-700 mb-4" />
                <h2 className="text-2xl font-bold font-arabic mb-4">المسلسل غير موجود</h2>
                <button onClick={() => navigate('/')} className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl font-arabic">
                    العودة للرئيسية
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-site text-main transition-colors duration-500" dir="rtl" lang="ar">
            <Header />

            {/* Video Player Section */}
            <AnimatePresence>
                {playerMode && activeEpisode && currentLink && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="relative z-[60] bg-black"
                    >
                        <div className="flex items-center justify-between px-6 py-3 bg-[#0a0a1a] border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setPlayerMode(false)} className="p-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                                    <MdClose className="text-2xl" />
                                </button>
                                <div>
                                    <h2 className="text-sm font-bold font-arabic">{series.titleAr || series.title}</h2>
                                    <p className="text-xs text-yellow-400 font-arabic">
                                        الموسم {currentSeason?.seasonNumber} • الحلقة {activeEpisode.episodeNumber}
                                        {activeEpisode.name && ` : ${activeEpisode.name}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <VideoPlayer
                            key={currentLink}
                            src={currentLink}
                            poster={activeEpisode.still || currentSeason?.poster || series.backdrop}
                            title={series.titleAr || series.title}
                            subtitle={`الموسم ${currentSeason?.seasonNumber} • الحلقة ${activeEpisode.episodeNumber}`}
                            introEnd={introEnd}
                        />

                        {/* Server Selection */}
                        {servers.length > 1 && (
                            <div className="p-4 flex flex-wrap gap-2 justify-center bg-[#0a0a1a]">
                                {servers.map((srv, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveServer(idx)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeServer === idx ? 'bg-yellow-400 text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                                    >
                                        {srv.name || `سيرفر ${idx + 1}`} ({srv.quality})
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section */}
            {!playerMode && (
                <div className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={currentSeason?.poster || series.backdrop || series.poster}
                            alt={series.titleAr}
                            className="w-full h-full object-cover transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050514] via-[#050514]/80 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050514] via-transparent to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#050514]/40 via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 h-full container mx-auto px-6 lg:px-16 flex flex-col justify-center pt-60 sm:pt-72">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-2xl"
                        >
                            {/* Type Badge */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-xs font-black font-arabic uppercase tracking-wider">
                                    مسلسل
                                </span>
                                {series.isNew && (
                                    <span className="bg-white/10 text-white px-3 py-1 rounded-lg text-xs font-bold font-arabic">
                                        جديد
                                    </span>
                                )}
                            </div>

                            {series.logo ? (
                                <img src={series.logo} alt={series.title} className="max-h-40 object-contain mb-8 drop-shadow-2xl" />
                            ) : (
                                <h1 className="text-5xl lg:text-7xl font-black font-arabic mb-8 drop-shadow-lg leading-tight">
                                    {series.titleAr || series.title}
                                </h1>
                            )}

                            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm lg:text-base font-bold">
                                <div className="flex items-center gap-1.5 text-yellow-400">
                                    <MdStar className="text-lg" />
                                    <span>{series.rating}</span>
                                </div>
                                <span className="text-gray-300 font-arabic border-r border-white/20 pr-6">
                                    {series.year}
                                </span>
                                <span className="text-cyan-400 font-arabic border-r border-white/20 pr-6">
                                    {series.seasons?.length || 0} مواسم
                                </span>
                                {series.quality && (
                                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs border border-white/10 font-black">
                                        {series.quality}
                                    </span>
                                )}
                            </div>

                            <p className="text-gray-200 text-lg lg:text-xl font-arabic leading-relaxed mb-10 line-clamp-3 max-w-2xl">
                                {series.overview}
                            </p>

                            <div className="flex flex-wrap gap-5">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 215, 0, 0.5)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (episodes.length > 0) handleEpisodeClick(episodes[0]);
                                    }}
                                    className="flex items-center gap-4 px-12 py-5 bg-yellow-400 text-black font-black rounded-2xl text-xl shadow-2xl transition-all font-arabic"
                                >
                                    <MdPlayCircle className="text-2xl" />
                                    شاهد الحلقة الأولى
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.05, background: isFav ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.15)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleFavorite(series)}
                                    className={`flex items-center gap-4 px-10 py-5 ${isFav ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' : 'bg-white/10 border-white/10 text-white'} backdrop-blur-xl border rounded-2xl font-bold text-xl transition-all font-arabic`}
                                >
                                    {isFav ? <MdFavorite className="text-2xl" /> : <MdFavoriteBorder className="text-2xl" />}
                                    {isFav ? 'في المفضلة' : 'أضف للمفضلة'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
                        <BiChevronDown className="text-2xl" />
                    </div>
                </div>
            )}

            {/* Bottom Content Area */}
            <div className="container mx-auto px-6 lg:px-16 py-12">
                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Episodes List Column */}
                    <div className="lg:col-span-2">
                        {/* Season Selection */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black font-arabic flex items-center gap-3">
                                <span className="w-2 h-8 bg-yellow-400 rounded-full" />
                                الحلقات
                            </h3>
                            <div className="flex gap-2">
                                {series.seasons?.map((season, idx) => (
                                    <button
                                        key={season.id}
                                        onClick={() => setActiveSeason(idx)}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold font-arabic transition-all ${activeSeason === idx ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400'}`}
                                    >
                                        الموسم {season.seasonNumber}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Episodes Grid */}
                        <div className="grid gap-4">
                            {episodes.map((ep) => {
                                const isActive = activeEpisode?.id === ep.id && playerMode;
                                return (
                                    <motion.div
                                        key={ep.id}
                                        whileHover={{ x: -10 }}
                                        onClick={() => handleEpisodeClick(ep)}
                                        className={`group relative flex items-center gap-6 p-4 rounded-3xl cursor-pointer transition-all border ${isActive ? 'bg-yellow-400/5 border-yellow-400/30 ring-1 ring-yellow-400/20' : 'bg-card border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}
                                    >
                                        {/* Episode Thumbnail */}
                                        <div className="relative flex-shrink-0 w-32 lg:w-48 aspect-video rounded-xl overflow-hidden bg-white/5">
                                            <img src={ep.still || currentSeason?.poster || series.backdrop} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MdPlayCircle className="text-4xl text-yellow-400 drop-shadow-lg" />
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold">
                                                حلقة {ep.episodeNumber}
                                            </div>
                                        </div>

                                        {/* Episode Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-xl font-black font-arabic mb-2 truncate ${isActive ? 'text-yellow-400' : 'text-main'}`}>
                                                {ep.name || `الحلقة ${ep.episodeNumber}`}
                                            </h4>
                                            <p className="text-muted text-sm font-arabic line-clamp-2 leading-relaxed">
                                                {ep.overview || series.overview}
                                            </p>
                                        </div>

                                        {/* Actions: Play + Download */}
                                        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-shrink-0">
                                            {/* Download Button */}
                                            {(() => {
                                                const dlServer = ep.servers?.find(s => s.downloadLink) || ep.servers?.[0];
                                                const dlLink = dlServer?.downloadLink || ep.downloadLink || dlServer?.watchLink || ep.watchLink;

                                                if (!dlLink) return null;
                                                return (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = dlLink;
                                                        }}
                                                        title="تحميل مباشر للحلقة"
                                                        className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all duration-300 border border-cyan-500/20 hover:border-transparent font-arabic font-bold text-[10px] sm:text-xs flex-shrink-0"
                                                    >
                                                        <MdDownload className="text-base sm:text-lg" />
                                                        <span className="hidden xs:inline">تحميل سريع</span>
                                                        <span className="xs:hidden">تحميل</span>
                                                    </motion.button>
                                                );
                                            })()}

                                            {/* Play Icon */}
                                            <div className={`p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-300 flex-shrink-0 ${isActive ? 'bg-yellow-400 text-black scale-110' : 'bg-white/5 text-gray-400 group-hover:text-yellow-400 group-hover:bg-yellow-400/10 group-hover:scale-105'}`}>
                                                <MdPlayCircle className="text-xl sm:text-2xl" />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Cast Section */}
                        {series.cast && series.cast.length > 0 && (
                            <section className="mt-16">
                                <h3 className="text-2xl font-black font-arabic mb-8 flex items-center gap-3">
                                    <span className="w-2 h-8 bg-yellow-400 rounded-full" />
                                    طاقم العمل
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {series.cast.map((actor, idx) => (
                                        <motion.div
                                            key={idx}
                                            whileHover={{ y: -5 }}
                                            className="bg-[#0a0a1a] border border-white/5 rounded-2xl overflow-hidden text-center group"
                                        >
                                            <div className="aspect-[3/4] overflow-hidden">
                                                <img
                                                    src={actor.photo || 'https://via.placeholder.com/200x300'}
                                                    alt={actor.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="p-4">
                                                <p className="font-bold text-sm font-arabic truncate text-white">{actor.name}</p>
                                                <p className="text-xs text-gray-500 font-arabic truncate mt-1">{actor.character}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar Info Column */}
                    <div className="space-y-8">
                        <div className="bg-card border border-white/5 rounded-[2.5rem] p-8 lg:p-10 shadow-2xl sticky top-32">
                            <h3 className="text-2xl font-black font-arabic mb-8 text-yellow-400">معلومات المسلسل</h3>
                            <div className="space-y-6">
                                <InfoItem
                                    icon={MdMovieFilter}
                                    label="النوع"
                                    value={categories.find(c => c.id === series.category)?.label || series.category}
                                />
                                {series.subcategory && (
                                    <InfoItem icon={MdMovieFilter} label="التصنيف الفرعي" value={series.subcategory} />
                                )}
                                <InfoItem icon={MdLanguage} label="اللغة" value={series.language || 'العربية'} />
                                <InfoItem icon={MdCalendarToday} label="سنة الإنتاج" value={series.year} />
                                <InfoItem icon={MdTv} label="عدد المواسم" value={`${series.seasons?.length || 0} مواسم`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Info Component
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center flex-shrink-0">
            <Icon className="text-xl text-yellow-400" />
        </div>
        <div>
            <p className="text-gray-500 text-[10px] font-bold font-arabic uppercase tracking-wide mb-0.5">{label}</p>
            <p className="text-white font-bold font-arabic text-sm">{value}</p>
        </div>
    </div>
);

export default SeriesPage;
