import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import logoWebm from '../assets/logo.webm';

export default function SplashScreen({ onFinish }) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onFinish, 500); // Give time for exit animation
        }, 3500);
        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050514] overflow-hidden"
                >
                    {/* Animated Background Elements */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.15, scale: 1.2 }}
                        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                        className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-blue-500/20 blur-[100px]"
                    />

                    <div className="relative flex flex-col items-center">
                        {/* Logo Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                                duration: 1.2,
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.2
                            }}
                            className="relative"
                        >
                            {/* Light Sweep Effect */}
                            <motion.div
                                initial={{ left: '-100%' }}
                                animate={{ left: '100%' }}
                                transition={{ duration: 1.5, delay: 1.5, ease: 'easeInOut' }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 z-10"
                            />

                            <video
                                autoPlay
                                loop={false}
                                muted
                                playsInline
                                onEnded={() => { }}
                                className="h-40 md:h-64 w-auto object-contain drop-shadow-[0_0_60px_rgba(255,215,0,0.4)]"
                                style={{ mixBlendMode: 'normal' }}
                            >
                                <source src={logoWebm} type="video/webm" />
                            </video>
                        </motion.div>

                        {/* Cinematic Text/Subtext */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="mt-8 flex flex-col items-center gap-4"
                        >
                            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                            <p className="text-gray-400 font-arabic tracking-[0.2em] text-sm uppercase opacity-60">
                                تجربة سينمائية لا مثيل لها
                            </p>
                        </motion.div>

                        {/* Loading Ring */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="absolute -bottom-24"
                        >
                            <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-yellow-400 animate-spin" />
                        </motion.div>
                    </div>

                    {/* Particle Effects (CSS based) */}
                    <div className="particles-container absolute inset-0 pointer-events-none opacity-30">
                        {[...Array(20)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: Math.random() * window.innerWidth,
                                    y: Math.random() * window.innerHeight,
                                    opacity: 0
                                }}
                                animate={{
                                    y: [null, Math.random() * -100],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 3 + 2,
                                    repeat: Infinity,
                                    delay: Math.random() * 2
                                }}
                                className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
