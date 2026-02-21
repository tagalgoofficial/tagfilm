import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { HiHome, HiHeart, HiTv, HiFilm } from 'react-icons/hi2';
import { useFavorites } from '../context/FavoritesContext';

const MobileNav = () => {
    const location = useLocation();
    const { favorites } = useFavorites();
    const currentPath = location.pathname;

    const navItems = [
        { id: 'home', label: 'الرئيسية', icon: <HiHome />, to: '/' },
        { id: 'movies', label: 'أفلام', icon: <HiFilm />, to: '/category/movies' },
        { id: 'series', label: 'مسلسلات', icon: <HiTv />, to: '/category/series' },
        { id: 'favorites', label: 'المفضلة', icon: <HiHeart />, to: '/favorites', badge: favorites.length },
    ];

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-4">
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative mx-auto max-w-lg bg-white/10 dark:bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] px-2 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex items-center justify-around"
                style={{
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Minimalist Active Indicator Container */}
                <div className="absolute inset-0 pointer-events-none px-2 flex items-center justify-around">
                    {navItems.map((item) => (
                        <div key={item.id} className="relative flex-1 flex justify-center h-full">
                            <AnimatePresence>
                                {currentPath === item.to && (
                                    <motion.div
                                        layoutId="activeTabMobileMinimal"
                                        className="absolute -bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-[0_0_10px_#ffd700]"
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                    />
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* Nav Links */}
                {navItems.map((item) => {
                    const isActive = currentPath === item.to;
                    return (
                        <Link
                            key={item.id}
                            to={item.to}
                            className="relative flex flex-col items-center justify-center flex-1 py-2"
                        >
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.3 : 1,
                                    y: isActive ? -4 : 0,
                                    color: isActive ? '#ffd700' : 'rgba(255,255,255,0.4)'
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="text-2xl relative"
                            >
                                {item.icon}

                                {item.badge > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black text-[9px] font-black rounded-full flex items-center justify-center border border-black/20"
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}

                                {/* Glow for active icon */}
                                {isActive && (
                                    <motion.div
                                        layoutId="iconGlow"
                                        className="absolute inset-0 bg-yellow-400/20 blur-lg rounded-full"
                                    />
                                )}
                            </motion.div>
                        </Link>
                    )
                })}
            </motion.div>
        </div>
    );
};

export default MobileNav;
