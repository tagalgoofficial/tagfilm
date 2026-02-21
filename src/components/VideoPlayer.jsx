import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* =====================
   أيقونات SVG داخلية
   ===================== */
const PlayIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M8 5v14l11-7z" />
    </svg>
);
const PauseIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);
const VolumeIcon = ({ level }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        {level === 0
            ? <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            : level < 0.5
                ? <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                : <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        }
    </svg>
);
const FullscreenIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        {active
            ? <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
            : <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        }
    </svg>
);
const SkipFwdIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
    </svg>
);
const SkipBwdIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
    </svg>
);
const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
        <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
    </svg>
);


const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
};

/* =====================
   المشغل الرئيسي
   ===================== */
const VideoPlayer = ({ src, title, subtitle, introEnd = 0, onNext, onPrev, hasNext, hasPrev, poster }) => {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const hideTimer = useRef(null);

    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [buffered, setBuffered] = useState(0);
    const [showSkipIntro, setShowSkipIntro] = useState(introEnd > 0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [seeking, setSeeking] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [doubleTapSide, setDoubleTapSide] = useState(null); // 'left' | 'right'

    /* ---- تلاشي أدوات التحكم ---- */
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        clearTimeout(hideTimer.current);
        if (playing) {
            hideTimer.current = setTimeout(() => setShowControls(false), 3500);
        }
    }, [playing]);

    useEffect(() => {
        resetHideTimer();
        return () => clearTimeout(hideTimer.current);
    }, [playing, resetHideTimer]);

    /* ---- أحداث الفيديو ---- */
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        const onTime = () => {
            setCurrentTime(v.currentTime);
            if (v.buffered.length > 0)
                setBuffered(v.buffered.end(v.buffered.length - 1));
            // skip intro: يظهر فوراً لو introEnd > 0 ولم يُغلق بعد، يختفي تلقائياً بعد تجاوز الوقت
            if (introEnd > 0 && v.currentTime >= introEnd) {
                setShowSkipIntro(false);
            }
        };
        const onLoaded = () => { setDuration(v.duration); setLoading(false); };
        const onWaiting = () => setLoading(true);
        const onPlaying = () => setLoading(false);
        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);
        v.addEventListener('timeupdate', onTime);
        v.addEventListener('loadedmetadata', onLoaded);
        v.addEventListener('waiting', onWaiting);
        v.addEventListener('playing', onPlaying);
        v.addEventListener('play', onPlay);
        v.addEventListener('pause', onPause);
        return () => {
            v.removeEventListener('timeupdate', onTime);
            v.removeEventListener('loadedmetadata', onLoaded);
            v.removeEventListener('waiting', onWaiting);
            v.removeEventListener('playing', onPlaying);
            v.removeEventListener('play', onPlay);
            v.removeEventListener('pause', onPause);
        };
    }, [introEnd]);

    // إعادة ضبط زر تخطي المقدمة عند تغيير الفيديو
    useEffect(() => {
        setShowSkipIntro(introEnd > 0);
        setCurrentTime(0);
    }, [src, introEnd]);

    /* ---- fullscreen listener ---- */
    useEffect(() => {
        const handler = () => setFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    /* ---- keyboard ---- */
    useEffect(() => {
        const onKey = (e) => {
            if (!containerRef.current?.contains(document.activeElement) && document.activeElement !== document.body) return;
            if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
            if (e.code === 'ArrowRight') seek(10);
            if (e.code === 'ArrowLeft') seek(-10);
            if (e.code === 'ArrowUp') { e.preventDefault(); setVol(Math.min(1, volume + 0.1)); }
            if (e.code === 'ArrowDown') { e.preventDefault(); setVol(Math.max(0, volume - 0.1)); }
            if (e.code === 'KeyF') toggleFullscreen();
            if (e.code === 'KeyM') toggleMute();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [volume, playing]);

    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) v.play();
        else v.pause();
        resetHideTimer();
    };

    const seek = (secs) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Math.max(0, Math.min(duration, v.currentTime + secs));
    };

    const setVol = (val) => {
        const v = videoRef.current;
        if (!v) return;
        v.volume = val;
        setVolume(val);
        setMuted(val === 0);
    };

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const skipIntro = () => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = introEnd;
        setShowSkipIntro(false);
    };

    const changeSpeed = (rate) => {
        const v = videoRef.current;
        if (!v) return;
        v.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSettings(false);
    };

    /* ---- شريط التقدم ---- */
    const handleProgressClick = (e) => {
        const rect = progressRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const v = videoRef.current;
        if (v) v.currentTime = ratio * duration;
    };

    const handleProgressMove = (e) => {
        if (!seeking) return;
        handleProgressClick(e);
    };

    /* ---- double tap ---- */
    const lastTap = useRef(0);
    const handleTap = (e, side) => {
        const now = Date.now();
        if (now - lastTap.current < 350) {
            seek(side === 'right' ? 10 : -10);
            setDoubleTapSide(side);
            setTimeout(() => setDoubleTapSide(null), 700);
        }
        lastTap.current = now;
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;
    const bufferedPct = duration ? (buffered / duration) * 100 : 0;
    const introEndPct = duration ? (introEnd / duration) * 100 : 0;

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-black select-none outline-none"
            style={{ aspectRatio: '16/9', maxHeight: '80vh' }}
            tabIndex={0}
            onMouseMove={resetHideTimer}
            onClick={togglePlay}
        >
            {/* الفيديو */}
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full"
                onClick={(e) => e.stopPropagation()}
                style={{ background: '#000' }}
            />

            {/* طبقات اللمس (mobile double-tap) */}
            <div className="absolute inset-0 flex pointer-events-none">
                <div className="flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); handleTap(e, 'left'); }} />
                <div className="w-1/5 pointer-events-auto" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
                <div className="flex-1 pointer-events-auto" onClick={(e) => { e.stopPropagation(); handleTap(e, 'right'); }} />
            </div>

            {/* تأثير double tap */}
            <AnimatePresence>
                {doubleTapSide && (
                    <motion.div
                        key={doubleTapSide}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute top-1/2 -translate-y-1/2 ${doubleTapSide === 'left' ? 'left-8' : 'right-8'} text-white text-center pointer-events-none`}
                    >
                        <div className="text-4xl mb-1">{doubleTapSide === 'left' ? '⏪' : '⏩'}</div>
                        <p className="text-sm font-bold">10 ثانية</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* تحميل */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 animate-spin" />
                </div>
            )}

            {/* زر تخطي المقدمة - تصميم شاهد */}
            <AnimatePresence>
                {showSkipIntro && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => { e.stopPropagation(); skipIntro(); }}
                        className="absolute bottom-20 left-4 z-30 flex items-center gap-1.5 font-arabic font-bold"
                        style={{
                            fontSize: '12px',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            background: 'rgba(20,20,30,0.82)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.25)',
                            backdropFilter: 'blur(6px)',
                            letterSpacing: '0.01em',
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13, opacity: 0.9 }}>
                            <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                        </svg>
                        تخطي المقدمة
                    </motion.button>
                )}
            </AnimatePresence>

            {/* أدوات التحكم */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col justify-between pointer-events-none"
                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.85) 100%)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* الشريط العلوي */}
                        <div className="flex items-center justify-between px-5 pt-4 pointer-events-auto">
                            <div dir="rtl">
                                <p className="text-white font-black font-arabic text-base leading-tight">{title}</p>
                                {subtitle && <p className="text-yellow-400 text-xs font-arabic mt-0.5">{subtitle}</p>}
                            </div>
                            {/* settings */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettings(p => !p)}
                                    className="w-8 h-8 text-white/80 hover:text-white transition p-1"
                                >
                                    <SettingsIcon />
                                </button>
                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="absolute left-0 top-10 rounded-2xl overflow-hidden z-50 min-w-[160px]"
                                            style={{ background: 'rgba(10,10,25,0.97)', border: '1px solid rgba(255,215,0,0.2)', backdropFilter: 'blur(20px)' }}
                                            dir="rtl"
                                        >
                                            <p className="text-gray-400 text-xs px-4 pt-3 pb-1 font-arabic font-bold">سرعة التشغيل</p>
                                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                                                <button key={r} onClick={() => changeSpeed(r)}
                                                    className={`w-full px-4 py-2.5 text-right text-sm font-arabic transition hover:bg-white/10 flex items-center justify-between
                                                    ${playbackRate === r ? 'text-yellow-400 font-bold' : 'text-gray-200'}`}>
                                                    <span>{r === 1 ? 'عادي' : `${r}x`}</span>
                                                    {playbackRate === r && <span className="text-yellow-400">✓</span>}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* وسط - أزرار التحكم */}
                        <div className="flex items-center justify-center gap-8 pointer-events-auto">
                            {/* السابق */}
                            {hasPrev && (
                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                    onClick={onPrev}
                                    className="w-10 h-10 text-white/70 hover:text-white transition">
                                    <SkipBwdIcon />
                                </motion.button>
                            )}
                            {/* تخطي 10 ثانية للخلف */}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => seek(-10)}
                                className="flex flex-col items-center text-white/80 hover:text-white transition">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                                    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                </svg>
                                <span className="text-[10px] font-bold -mt-1">10</span>
                            </motion.button>
                            {/* تشغيل/إيقاف */}
                            <motion.button
                                whileHover={{ scale: 1.08 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full flex items-center justify-center text-black shadow-2xl"
                                style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}
                            >
                                <div className="w-7 h-7">
                                    {playing ? <PauseIcon /> : <PlayIcon />}
                                </div>
                            </motion.button>
                            {/* تخطي 10 ثانية للأمام */}
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => seek(10)}
                                className="flex flex-col items-center text-white/80 hover:text-white transition">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                                    <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                                </svg>
                                <span className="text-[10px] font-bold -mt-1">10</span>
                            </motion.button>
                            {/* التالي */}
                            {hasNext && (
                                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                                    onClick={onNext}
                                    className="w-10 h-10 text-white/70 hover:text-white transition">
                                    <SkipFwdIcon />
                                </motion.button>
                            )}
                        </div>

                        {/* الشريط السفلي */}
                        <div className="px-5 pb-4 space-y-2 pointer-events-auto">
                            {/* الوقت */}
                            <div className="flex items-center justify-between text-white text-xs font-mono" dir="ltr">
                                <span>{formatTime(currentTime)}</span>
                                <span className="text-white/50">{formatTime(duration)}</span>
                            </div>

                            {/* شريط التقدم */}
                            <div
                                ref={progressRef}
                                className="relative w-full h-1.5 rounded-full cursor-pointer group"
                                style={{ background: 'rgba(255,255,255,0.2)', direction: 'ltr' }}
                                onClick={handleProgressClick}
                                onMouseMove={handleProgressMove}
                                onMouseDown={() => setSeeking(true)}
                                onMouseUp={() => setSeeking(false)}
                            >
                                {/* المخزن مؤقتاً */}
                                <div className="absolute inset-y-0 left-0 rounded-full transition-all"
                                    style={{ width: `${bufferedPct}%`, background: 'rgba(255,255,255,0.3)' }} />
                                {/* المقدمة */}
                                {introEndPct > 0 && (
                                    <div className="absolute inset-y-0 left-0 rounded-full opacity-50"
                                        style={{ width: `${introEndPct}%`, background: 'rgba(255,215,0,0.5)' }} />
                                )}
                                {/* التقدم */}
                                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                                    style={{ width: `${progress}%`, background: 'linear-gradient(to right, #ff8c00, #ffd700)' }} />
                                {/* المؤشر */}
                                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                    style={{ left: `calc(${progress}% - 8px)`, background: '#ffd700', boxShadow: '0 0 8px rgba(255,215,0,0.8)' }} />
                            </div>

                            {/* أزرار الصوت والشاشة الكاملة */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {/* الصوت */}
                                    <div className="flex items-center gap-2"
                                        onMouseEnter={() => setShowVolumeSlider(true)}
                                        onMouseLeave={() => setShowVolumeSlider(false)}
                                    >
                                        <button onClick={toggleMute} className="w-6 h-6 text-white/80 hover:text-white transition">
                                            <VolumeIcon level={muted || volume === 0 ? 0 : volume} />
                                        </button>
                                        <AnimatePresence>
                                            {showVolumeSlider && (
                                                <motion.input
                                                    initial={{ width: 0, opacity: 0 }}
                                                    animate={{ width: 80, opacity: 1 }}
                                                    exit={{ width: 0, opacity: 0 }}
                                                    type="range" min="0" max="1" step="0.05"
                                                    value={muted ? 0 : volume}
                                                    onChange={e => setVol(parseFloat(e.target.value))}
                                                    className="h-1 accent-yellow-400 cursor-pointer"
                                                    style={{ width: 80 }}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    {/* السرعة */}
                                    {playbackRate !== 1 && (
                                        <span className="text-yellow-400 text-xs font-bold">{playbackRate}x</span>
                                    )}
                                </div>

                                {/* الشاشة الكاملة */}
                                <button onClick={toggleFullscreen} className="w-6 h-6 text-white/80 hover:text-white transition">
                                    <FullscreenIcon active={fullscreen} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VideoPlayer;
