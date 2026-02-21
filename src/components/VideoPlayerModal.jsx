import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from 'react-icons/io';
import { BsPlayFill, BsPauseFill, BsVolumeMute, BsVolumeUp, BsFullscreen } from 'react-icons/bs';
import { useState, useRef } from 'react';

const VideoPlayerModal = ({ isOpen, onClose, movieTitle }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (videoRef.current) {
            videoRef.current.currentTime = pos * duration;
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="relative w-full max-w-5xl bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="absolute top-4 left-4 z-50 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-accent-gold hover:text-black transition-all duration-300 border-2 border-white/20"
                        >
                            <IoMdClose className="text-2xl" />
                        </motion.button>

                        {/* Title */}
                        <div className="absolute top-4 right-4 left-20 z-50">
                            <h3 className="text-white text-xl font-bold font-arabic truncate px-4 py-2 bg-black/70 backdrop-blur-sm rounded-full">
                                {movieTitle}
                            </h3>
                        </div>

                        {/* Video Container */}
                        <div className="relative aspect-video bg-black group">
                            <video
                                ref={videoRef}
                                className="w-full h-full"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                playsInline
                                muted={isMuted}
                                poster="https://image.tmdb.org/t/p/original/feSiISwgEpVzR1v3zv2n2AU4ANJ.jpg"
                            >
                                <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                                متصفحك لا يدعم تشغيل الفيديو
                            </video>

                            {/* Play/Pause Overlay */}
                            <div
                                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                                onClick={togglePlay}
                            >
                                <AnimatePresence>
                                    {!isPlaying && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="bg-accent-gold/90 backdrop-blur-sm rounded-full p-8 shadow-2xl"
                                        >
                                            <BsPlayFill className="text-6xl text-black" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Controls */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6"
                            >
                                {/* Progress Bar */}
                                <div
                                    className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer overflow-hidden group/progress"
                                    onClick={handleSeek}
                                >
                                    <div
                                        className="h-full bg-accent-gold transition-all duration-200 relative"
                                        style={{ width: `${(currentTime / duration) * 100}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-accent-gold rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Control Buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* Play/Pause */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={togglePlay}
                                            className="text-white hover:text-accent-gold transition-colors"
                                        >
                                            {isPlaying ? (
                                                <BsPauseFill className="text-3xl" />
                                            ) : (
                                                <BsPlayFill className="text-3xl" />
                                            )}
                                        </motion.button>

                                        {/* Volume */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={toggleMute}
                                            className="text-white hover:text-accent-gold transition-colors"
                                        >
                                            {isMuted ? (
                                                <BsVolumeMute className="text-2xl" />
                                            ) : (
                                                <BsVolumeUp className="text-2xl" />
                                            )}
                                        </motion.button>

                                        {/* Time */}
                                        <span className="text-white text-sm font-medium">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Fullscreen */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={toggleFullscreen}
                                            className="text-white hover:text-accent-gold transition-colors"
                                        >
                                            <BsFullscreen className="text-xl" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoPlayerModal;
