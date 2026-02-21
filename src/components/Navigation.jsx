import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { BiCameraMovie } from 'react-icons/bi';
import { MdOutlineTv } from 'react-icons/md';
import { GiLanternFlame } from 'react-icons/gi';
import { HiViewGrid, HiChevronDown } from 'react-icons/hi';
import { MdSettings } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { getCategories, initDefaultCategories } from '../firebase/categoriesService';

const ICON_MAP = {
    movies: BiCameraMovie,
    series: MdOutlineTv,
    ramadan: GiLanternFlame,
    other: HiViewGrid,
};

const Navigation = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            await initDefaultCategories();
            const cats = await getCategories();
            setCategories(cats);
            setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-6">
                <div className="w-full px-8 py-6 border-2 border-white/30 rounded-3xl bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-12 w-36 rounded-xl bg-white/10 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-6">
            <div className="w-full px-8 py-6 border-2 border-white/30 rounded-3xl bg-white/5 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-6 flex-wrap">
                    {categories.map((category, index) => {
                        const Icon = ICON_MAP[category.icon] || HiViewGrid;
                        return (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => setHoveredCategory(category.id)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                {/* زر التصنيف الرئيسي - يتنقل للصفحة */}
                                <motion.button
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    whileHover={{ y: -4, scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate(`/category/${category.id}`)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap
                                        ${hoveredCategory === category.id
                                            ? 'bg-gradient-to-r from-accent-neon/20 to-accent-gold/20 text-accent-gold shadow-lg shadow-accent-gold/30'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {category.icon === 'ramadan' ? (
                                        <motion.div
                                            animate={{ rotate: [-5, 5, -5] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            <Icon className="text-2xl" />
                                        </motion.div>
                                    ) : (
                                        <Icon className="text-2xl" />
                                    )}
                                    <div className="flex flex-col items-start">
                                        <span className="font-arabic text-base">{category.label}</span>
                                        <span className="text-xs opacity-60">{category.labelEn}</span>
                                    </div>
                                    {category.subcategories?.length > 0 && (
                                        <HiChevronDown className={`text-lg transition-transform duration-300 ${hoveredCategory === category.id ? 'rotate-180' : ''}`} />
                                    )}
                                </motion.button>

                                {/* القائمة المنسدلة للتصنيفات الفرعية */}
                                <AnimatePresence>
                                    {hoveredCategory === category.id && category.subcategories?.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                                            style={{ transformOrigin: 'top', background: 'rgba(18,18,42,0.98)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,215,0,0.15)' }}
                                            className="absolute top-full left-0 mt-2 w-56 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        >
                                            {/* عنوان القائمة */}
                                            <div className="px-4 py-2 border-b border-white/5">
                                                <p className="text-yellow-400 text-xs font-arabic font-bold">{category.label}</p>
                                            </div>
                                            {/* الكل */}
                                            <motion.button
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => { navigate(`/category/${category.id}`); setHoveredCategory(null); }}
                                                className="w-full px-5 py-3 text-right text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 font-arabic text-sm flex items-center justify-between"
                                            >
                                                <span>عرض الكل</span>
                                                <span className="text-xs text-gray-600">←</span>
                                            </motion.button>
                                            {/* التصنيفات الفرعية */}
                                            {category.subcategories.map((sub, idx) => {
                                                const name = typeof sub === 'string' ? sub : sub.name;
                                                return (
                                                    <motion.button
                                                        key={name}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.04 }}
                                                        onClick={() => {
                                                            navigate(`/category/${category.id}/${encodeURIComponent(name)}`);
                                                            setHoveredCategory(null);
                                                        }}
                                                        className="w-full px-5 py-2.5 text-right text-gray-400 hover:bg-yellow-400/10 hover:text-yellow-400 transition-all duration-200 font-arabic text-sm"
                                                    >
                                                        {name}
                                                    </motion.button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                </div>
            </div>
        </div>
    );
};

export default Navigation;
