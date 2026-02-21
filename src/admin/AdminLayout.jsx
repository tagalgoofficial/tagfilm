import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MdDashboard, MdMovieFilter, MdLiveTv, MdCategory,
    MdViewCarousel, MdMenu, MdClose, MdSearch, MdArrowBack, MdStar
} from 'react-icons/md';
import { BiCameraMovie } from 'react-icons/bi';
import logo from '../assets/Logo.png';

const navItems = [
    { path: '/admin', label: 'لوحة التحكم', icon: MdDashboard, exact: true },
    { path: '/admin/movies', label: 'إدارة الأفلام', icon: BiCameraMovie },
    { path: '/admin/series', label: 'إدارة المسلسلات', icon: MdLiveTv },
    { path: '/admin/categories', label: 'إدارة التصنيفات', icon: MdCategory },
    { path: '/admin/sections', label: 'إدارة الأقسام', icon: MdViewCarousel },
    { path: '/admin/featured', label: 'الكافر المميز ⭐', icon: MdStar },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a1a] text-white" dir="rtl">
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: 280 }}
                        animate={{ x: 0 }}
                        exit={{ x: 280 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-screen w-72 z-50 flex flex-col"
                        style={{
                            background: 'linear-gradient(180deg, #12122a 0%, #0d0d20 100%)',
                            borderLeft: '1px solid rgba(255,215,0,0.1)',
                            boxShadow: '-4px 0 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Logo */}
                        <div className="flex flex-col items-center gap-6 px-4 py-10 border-b border-white/10 text-center">
                            <img src={logo} alt="TagFilm Logo" className="h-[120px] w-auto object-contain" />
                            <h1 className="text-xl font-black text-yellow-400" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                Admin Panel
                            </h1>
                            <button onClick={() => setSidebarOpen(false)}
                                className="absolute top-4 left-4 text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
                                <MdClose className="text-xl" />
                            </button>
                        </div>

                        {/* Nav Items */}
                        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item);
                                return (
                                    <Link key={item.path} to={item.path}>
                                        <motion.div
                                            whileHover={{ x: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 cursor-pointer ${active
                                                ? 'text-black shadow-lg shadow-yellow-500/20'
                                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                                }`}
                                            style={active ? {
                                                background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
                                            } : {}}
                                        >
                                            <Icon className={`text-xl flex-shrink-0 ${active ? 'text-black' : ''}`} />
                                            <span className="font-arabic font-semibold text-sm">{item.label}</span>
                                            {active && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="mr-auto w-2 h-2 rounded-full bg-black/50"
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Back to Site */}
                        <div className="px-4 py-4 border-t border-white/10">
                            <Link to="/"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                <MdArrowBack className="text-lg" />
                                <span className="text-sm font-arabic">العودة للموقع</span>
                            </Link>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div
                className="flex-1 flex flex-col transition-all duration-300"
                style={{ marginRight: sidebarOpen ? '288px' : '0' }}
            >
                {/* Top Bar */}
                <header className="sticky top-0 z-40 px-6 py-4 border-b border-white/10 flex items-center gap-4"
                    style={{ background: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(20px)' }}>
                    {!sidebarOpen && (
                        <button onClick={() => setSidebarOpen(true)}
                            className="text-gray-400 hover:text-white transition p-2 rounded-xl hover:bg-white/10">
                            <MdMenu className="text-2xl" />
                        </button>
                    )}
                    <div className="flex-1 flex items-center gap-3 max-w-md">
                        <div className="flex-1 relative">
                            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="بحث سريع..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-10 pl-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition"
                            />
                        </div>
                    </div>
                    <div className="mr-auto flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-white">TagFilm Admin</p>
                            <p className="text-xs text-gray-400">مدير النظام</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-sm"
                            style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                            T
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
