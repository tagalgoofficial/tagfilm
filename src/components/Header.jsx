import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.png';
import logoWebm from '../assets/logo.webm';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const { favorites } = useFavorites();
    const { user, activeProfile } = useAuth();

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
            <div className="container mx-auto px-6 py-0 flex items-center justify-between" dir="rtl">
                {/* Right Side: Logo + Navigation Links */}
                <div className="flex items-center gap-10">
                    <Link to="/">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2.5 flex-shrink-0"
                        >
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-[50px] sm:h-[70px] w-auto object-contain drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]"
                            >
                                <source src={logoWebm} type="video/webm" />
                                <img src={logo} alt="TagFilm Logo" className="h-[50px] sm:h-[70px] w-auto object-contain" />
                            </video>
                        </motion.div>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {[
                            { label: 'الرئيسية', to: '/' },
                            { label: 'الأفلام', to: '/category/movies' },
                            { label: 'المسلسلات', to: '/category/series' },
                            { label: 'البرامج التلفزيونية', to: '/category/tv-shows' },
                            { label: 'رمضان', to: '/category/ramadan' },
                            { label: 'أطفال', to: '/category/kids' },
                        ].map(link => (
                            <Link key={link.to} to={link.to}
                                className="font-arabic text-sm font-bold transition-all duration-300 relative group/link text-white">
                                {link.label}
                                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover/link:w-full" />
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Left Side: Search + Favorites */}
                <div className="flex items-center gap-2 sm:gap-4">
                    <AnimatedSearch />

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

                    {user ? (
                        <div className="relative group/profile">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white border-2 border-transparent hover:border-white transition-all overflow-hidden cursor-pointer"
                            >
                                {activeProfile?.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </motion.div>

                            {/* Dropdown Menu */}
                            <div className="absolute left-0 mt-2 w-48 bg-[#0a0a1f] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300 z-[100] overflow-hidden">
                                <Link to="/profile" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 font-arabic">
                                    الملف الشخصي
                                </Link>
                                <Link to="/profiles" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 font-arabic">
                                    إدارة الملفات
                                </Link>
                                <Link to="/account" className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 font-arabic">
                                    إعدادات الحساب
                                </Link>
                                <button
                                    onClick={() => {/* logout logic will be handled by the context but I'll add a simple way here if needed or just let them go to account to logout */ }}
                                    className="w-full text-right block px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors font-arabic"
                                >
                                    تسجيل الخروج
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Link to="/login">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-bold font-arabic transition-all shadow-lg shadow-blue-900/40"
                            >
                                دخول
                            </motion.button>
                        </Link>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

const AnimatedSearch = () => {
    const navigate = useNavigate();
    return (
        <motion.button
            onClick={() => navigate('/search')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10"
        >
            <FiSearch className="text-white text-base" />
        </motion.button>
    );
};

export default Header;
