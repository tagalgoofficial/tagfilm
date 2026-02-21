import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AiFillPlayCircle, AiFillStar } from 'react-icons/ai';
import { BsInfoCircle, BsChevronDown } from 'react-icons/bs';
import { MdVolumeOff, MdVolumeUp } from 'react-icons/md';

const HeroBanner = ({ items = [] }) => {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [muted, setMuted] = useState(true);
    const [autoPlay, setAutoPlay] = useState(true);

    const goTo = useCallback((idx, dir = 1) => {
        setDirection(dir);
        setCurrent(idx);
    }, []);

    const next = useCallback(() => {
        const nextIdx = (current + 1) % items.length;
        goTo(nextIdx, 1);
    }, [current, items.length, goTo]);

    const prev = useCallback(() => {
        const prevIdx = (current - 1 + items.length) % items.length;
        goTo(prevIdx, -1);
    }, [current, items.length, goTo]);

    // Auto-slide every 8 seconds
    useEffect(() => {
        if (!autoPlay || items.length <= 1) return;
        const timer = setTimeout(() => next(), 8000);
        return () => clearTimeout(timer);
    }, [current, autoPlay, next, items.length]);

    if (!items || items.length === 0) {
        return (
            <div className="relative w-full flex items-center justify-center" style={{ height: '100vh', background: 'linear-gradient(135deg, #0a0a1f 0%, #1a1a3e 100%)' }}>
                <div className="text-center">
                    <div className="text-6xl mb-6">🎬</div>
                    <p className="text-gray-400 font-arabic text-xl">جارٍ تجهيز المحتوى المميز قريباً</p>
                </div>
            </div>
        );
    }

    const item = items[current];
    const type = item.type || (item.seasons ? 'series' : 'movie');
    const linkPath = type === 'series' ? `/series/${item.contentId}` : `/movie/${item.contentId}`;

    const slideVariants = {
        enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
        center: { opacity: 1, x: 0 },
        exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
    };

    return (
        <div className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: '600px' }}>
            {/* Background Layer */}
            <AnimatePresence mode="sync" custom={direction}>
                <motion.div
                    key={`bg-${current}`}
                    custom={direction}
                    variants={{
                        enter: () => ({ opacity: 0, scale: 1.04 }),
                        center: { opacity: 1, scale: 1 },
                        exit: () => ({ opacity: 0, scale: 0.98 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                    className="absolute inset-0"
                >
                    <img
                        src={item.backdrop || item.poster}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center top' }}
                    />
                    {/* Multi-layer gradient overlay */}
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(5,5,20,1) 0%, rgba(5,5,20,0.8) 20%, rgba(5,5,20,0.3) 50%, transparent 100%)'
                    }} />
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to top, rgba(5,5,20,0.8) 0%, transparent 40%)'
                    }} />
                    {/* Top gradient for header readability */}
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to bottom, rgba(5,5,20,0.7) 0%, transparent 20%)'
                    }} />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center pb-24 sm:pb-16" dir="rtl">
                <div className="container mx-auto px-6 lg:px-16 pt-20">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={`content-${current}`}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="max-w-xl lg:max-w-2xl"
                        >
                            {/* Type Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                    style={{ background: item.type === 'series' ? 'rgba(0,212,255,0.15)' : 'rgba(255,150,0,0.15)', border: `1px solid ${item.type === 'series' ? '#00d4ff' : '#ff9600'}50`, color: item.type === 'series' ? '#00d4ff' : '#ff9600' }}>
                                    {item.type === 'series' ? '📺 مسلسل' : '🎬 فيلم'}
                                </span>
                                {item.isNew && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}>
                                        ✦ جديد
                                    </span>
                                )}
                            </motion.div>

                            {/* Logo / Title */}
                            {item.logo ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="mb-8"
                                >
                                    <img
                                        src={item.logo}
                                        alt={item.title}
                                        className="max-h-40 sm:max-h-64 object-contain"
                                        style={{ filter: 'drop-shadow(0 0 35px rgba(0,0,0,0.9))' }}
                                    />
                                </motion.div>
                            ) : (
                                <motion.h2
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="font-black font-arabic mb-4 leading-tight"
                                    style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', textShadow: '0 2px 30px rgba(0,0,0,0.9)', color: '#fff' }}
                                >
                                    {item.title}
                                </motion.h2>
                            )}
                            {/* Meta Info Row */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex items-center gap-4 mb-4 flex-wrap"
                            >
                                {item.rating && (
                                    <div className="flex items-center gap-1.5">
                                        <AiFillStar style={{ color: '#ffd700' }} />
                                        <span className="text-white font-bold text-sm">{item.rating}</span>
                                    </div>
                                )}
                                {item.year && <span className="text-gray-300 text-sm font-medium">{item.year}</span>}
                                {item.quality && (
                                    <span className="px-2.5 py-0.5 rounded text-xs font-bold" style={{ background: '#ffd70020', color: '#ffd700', border: '1px solid #ffd70040' }}>
                                        {item.quality}
                                    </span>
                                )}
                                {item.duration && <span className="text-gray-400 text-sm">{item.duration}</span>}
                                {item.country && <span className="text-gray-400 text-sm">{item.country}</span>}
                            </motion.div>

                            {/* Genres */}
                            {item.genres && item.genres.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex items-center gap-2 mb-4 flex-wrap"
                                >
                                    {item.genres.map((g, i) => (
                                        <span key={i} className="text-xs px-3 py-1 rounded-full font-arabic"
                                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#ddd' }}>
                                            {g}
                                        </span>
                                    ))}
                                </motion.div>
                            )}

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="text-gray-300 font-arabic leading-relaxed mb-7 line-clamp-3"
                                style={{ fontSize: '0.95rem', maxWidth: '520px' }}
                            >
                                {item.description}
                            </motion.p>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                                <Link to={linkPath} className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,215,0,0.6)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold font-arabic text-black text-sm sm:text-base"
                                        style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }}
                                    >
                                        <AiFillPlayCircle className="text-xl" />
                                        شاهد الآن
                                    </motion.button>
                                </Link>
                                <Link to={linkPath} className="w-full sm:w-auto">
                                    <motion.button
                                        whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.2)' }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full font-bold font-arabic text-white text-sm sm:text-base"
                                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}
                                    >
                                        <BsInfoCircle className="text-lg" />
                                        التفاصيل
                                    </motion.button>
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Cinematic Logo Selection Bar */}
            {items.length > 1 && (
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 z-20 flex justify-center px-4">
                    <div className="flex items-center gap-6 sm:gap-16 px-6 sm:px-14 py-4 sm:py-8 bg-black/50 backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-x-auto hide-scrollbar max-w-full sm:max-w-max mx-auto">
                        {items.map((it, i) => (
                            <button
                                key={i}
                                onClick={() => { setAutoPlay(false); goTo(i, i > current ? 1 : -1); }}
                                className="group relative flex flex-col items-center flex-shrink-0 transition-all duration-500"
                                style={{
                                    opacity: i === current ? 1 : 0.45,
                                    transform: i === current ? 'scale(1.1)' : 'scale(0.9)'
                                }}
                            >
                                <div className="h-10 sm:h-24 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                                    {(it.logo || it.titleLogo) ? (
                                        <img
                                            src={it.logo || it.titleLogo}
                                            alt={it.title}
                                            className="h-full w-auto object-contain max-w-[100px] sm:max-w-[240px]"
                                            style={{
                                                filter: i === current
                                                    ? 'drop-shadow(0 0 15px rgba(255,12,12,0.6))'
                                                    : 'grayscale(0.8) brightness(0.7)'
                                            }}
                                        />
                                    ) : (
                                        <span className="text-white font-black font-arabic text-sm sm:text-2xl whitespace-nowrap px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10">
                                            {it.title}
                                        </span>
                                    )}
                                </div>

                                {i === current && (
                                    <motion.div
                                        layoutId="heroNavIndicator"
                                        className="absolute -bottom-2 w-3/4 h-1.5 bg-red-600 rounded-full"
                                        style={{ boxShadow: '0 0 25px #ef4444, 0 0 50px rgba(239, 68, 68, 0.5)' }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Arrow Navigation */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={() => { setAutoPlay(false); next(); }}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => { setAutoPlay(false); prev(); }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
                    >
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Mute Toggle */}
            <button
                onClick={() => setMuted(!muted)}
                className="absolute bottom-24 sm:bottom-28 left-6 sm:left-8 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
            >
                {muted ? <MdVolumeOff className="text-white text-lg" /> : <MdVolumeUp className="text-white text-lg" />}
            </button>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 opacity-60"
            >
                <BsChevronDown className="text-white text-xl" />
            </motion.div>

            {/* Bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
                background: 'linear-gradient(to top, #050514 0%, transparent 100%)'
            }} />
        </div>
    );
};

export default HeroBanner;
