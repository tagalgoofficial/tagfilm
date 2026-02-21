import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.png';
import { useFavorites } from '../context/FavoritesContext';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { favorites } = useFavorites();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
            style={{
                background: scrolled
                    ? 'var(--bg-overlay)'
                    : 'linear-gradient(to bottom, rgba(5,5,20,0.95) 0%, transparent 100%)',
                backdropFilter: scrolled ? 'blur(20px)' : 'blur(4px)',
                borderBottom: scrolled ? '1px solid var(--border-subtle)' : 'none',
                paddingTop: 'var(--safe-top)',
            }}
        >
            <div className="container mx-auto px-6 py-0 flex items-center justify-between gap-6" dir="rtl">
                {/* Logo */}
                <Link to="/">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2.5 flex-shrink-0"
                    >
                        <img
                            src={logo}
                            alt="TagFilm Logo"
                            className="h-[100px] sm:h-[130px] w-auto object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                        />
                    </motion.div>
                </Link>

                {/* Nav links (center - hidden on mobile) */}
                <nav className="hidden lg:flex items-center gap-6">
                    {[
                        { label: 'الرئيسية', to: '/' },
                        { label: 'أفلام', to: '/category/movies' },
                        { label: 'مسلسلات', to: '/category/series' },
                    ].map(link => (
                        <Link key={link.to} to={link.to}
                            className={`font-arabic text-sm font-medium transition-colors duration-200 hover:text-yellow-400 ${scrolled ? 'text-gray-600' : 'text-gray-300'}`}>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right side: Search + Favorites */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Search */}
                    <AnimatedSearch open={searchOpen} onToggle={() => setSearchOpen(!searchOpen)} />

                    {/* Favorites Icon - Hidden on mobile because it's in bottom nav */}
                    <Link to="/favorites" className="hidden sm:block">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-400/10"
                        >
                            <AiFillHeart className={`text-xl ${favorites.length > 0 ? 'text-yellow-400' : 'text-white'}`} />
                            {favorites.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-black text-[10px] font-bold flex items-center justify-center shadow-lg">
                                    {favorites.length}
                                </span>
                            )}
                        </motion.div>
                    </Link>
                </div>
            </div>
        </motion.header>
    );
};

const AnimatedSearch = ({ open, onToggle }) => (
    <div className="flex items-center">
        <motion.div
            animate={{ width: open ? 220 : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
        >
            <input
                type="text"
                placeholder="ابحث عن أفلام، مسلسلات..."
                autoFocus={open}
                className="w-full bg-white/8 border border-white/15 rounded-full px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/50 text-sm font-arabic"
                style={{ background: 'rgba(255,255,255,0.06)' }}
            />
        </motion.div>
        <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="ml-2 w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: open ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
            <FiSearch className="text-white text-base" />
        </motion.button>
    </div>
);

export default Header;
