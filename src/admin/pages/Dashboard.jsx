import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BiCameraMovie } from 'react-icons/bi';
import { MdLiveTv, MdCategory, MdViewCarousel, MdAdd, MdTrendingUp } from 'react-icons/md';
import { getMovies } from '../../firebase/moviesService';
import { getSeries } from '../../firebase/seriesService';
import { getCategories } from '../../firebase/categoriesService';
import { getSections } from '../../firebase/sectionsService';

const StatCard = ({ icon: Icon, label, value, color, link, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        whileHover={{ y: -4, scale: 1.02 }}
    >
        <Link to={link}>
            <div className="relative overflow-hidden rounded-2xl p-6 cursor-pointer group"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${color}15, transparent)` }} />
                <div className="relative flex items-start justify-between">
                    <div>
                        <p className="text-gray-400 text-sm font-arabic mb-1">{label}</p>
                        <p className="text-4xl font-black text-white">{value}</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                        <Icon className="text-white text-2xl" />
                    </div>
                </div>
                <div className="relative mt-4 flex items-center gap-2 text-xs text-gray-400">
                    <MdTrendingUp style={{ color }} />
                    <span>إدارة كاملة ←</span>
                </div>
            </div>
        </Link>
    </motion.div>
);

const QuickAction = ({ icon: Icon, label, to, color }) => (
    <Link to={to}>
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 p-4 rounded-xl transition-all cursor-pointer"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                <Icon className="text-white text-lg" />
            </div>
            <span className="text-white text-sm font-arabic font-medium">{label}</span>
            <MdAdd className="mr-auto text-gray-400 text-lg" />
        </motion.div>
    </Link>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ movies: 0, series: 0, categories: 0, sections: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [movies, series, categories, sections] = await Promise.all([
                    getMovies(), getSeries(), getCategories(), getSections()
                ]);
                setStats({
                    movies: movies.length,
                    series: series.length,
                    categories: categories.length,
                    sections: sections.length,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { icon: BiCameraMovie, label: 'إجمالي الأفلام', value: stats.movies, color: '#ffd700', link: '/admin/movies', delay: 0.1 },
        { icon: MdLiveTv, label: 'إجمالي المسلسلات', value: stats.series, color: '#00d4ff', link: '/admin/series', delay: 0.2 },
        { icon: MdCategory, label: 'التصنيفات الرئيسية', value: stats.categories, color: '#a855f7', link: '/admin/categories', delay: 0.3 },
        { icon: MdViewCarousel, label: 'أقسام الصفحة الرئيسية', value: stats.sections, color: '#22c55e', link: '/admin/sections', delay: 0.4 },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-black text-white mb-1">
                    أهلاً بك في{' '}
                    <span style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        TagFilm
                    </span>
                </h1>
                <p className="text-gray-400 font-arabic">إدارة كاملة للمحتوى، التصنيفات، والأقسام</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <StatCard key={card.label} {...card} value={loading ? '...' : card.value} />
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}
                >
                    <h2 className="text-lg font-black text-white mb-4 font-arabic flex items-center gap-2">
                        <MdAdd className="text-yellow-400" /> إجراءات سريعة
                    </h2>
                    <div className="space-y-3">
                        <QuickAction icon={BiCameraMovie} label="إضافة فيلم جديد" to="/admin/movies" color="#ffd700" />
                        <QuickAction icon={MdLiveTv} label="إضافة مسلسل جديد" to="/admin/series" color="#00d4ff" />
                        <QuickAction icon={MdCategory} label="إضافة تصنيف جديد" to="/admin/categories" color="#a855f7" />
                        <QuickAction icon={MdViewCarousel} label="إدارة أقسام الرئيسية" to="/admin/sections" color="#22c55e" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,0,0.05))',
                        border: '1px solid rgba(255,215,0,0.2)',
                    }}
                >
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg, #ffd700, #ff8c00)' }}>
                        <BiCameraMovie className="text-black text-3xl" />
                    </div>
                    <h3 className="text-xl font-black text-yellow-400 font-arabic mb-2">مرحباً بك</h3>
                    <p className="text-gray-400 text-sm font-arabic leading-relaxed">
                        يمكنك إضافة وتعديل وحذف الأفلام والمسلسلات وإدارة التصنيفات وأقسام الصفحة الرئيسية بشكل كامل
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-green-400 text-sm">Firebase متصل</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
