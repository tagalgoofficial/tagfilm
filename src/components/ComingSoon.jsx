import { useState, useEffect } from 'react';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';
import { motion } from 'framer-motion';

export default function ComingSoon() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComingSoon = async () => {
            try {
                const [movies, series] = await Promise.all([getMovies(), getSeries()]);
                const all = [...movies, ...series].filter(item => item.isComingSoon === true);
                setItems(all.slice(0, 10));
            } catch (error) {
                console.error("Error fetching coming soon:", error);
            }
            setLoading(false);
        };
        fetchComingSoon();
    }, []);

    const handleRemind = async (item) => {
        if (!("Notification" in window)) {
            alert("متصفحك لا يدعم الإشعارات");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification("TagFilm", {
                    body: `سنقوم بتذكيرك فور صدور: ${item.titleAr || item.title}`,
                    icon: '/logo192.png'
                });
                alert(`تم تفعيل التنبيه لـ ${item.titleAr || item.title}`);
            }
        } catch (error) {
            console.error("Notification error:", error);
        }
    };

    if (loading) return null;
    if (items.length === 0) return null;

    return (
        <div className="py-12 px-4 md:px-12" dir="rtl">
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-yellow-400 rounded-full"></span>
                قريباً على TagFilm
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ y: -5 }}
                        className="relative rounded-3xl overflow-hidden aspect-[16/9] border border-white/5 bg-white/5 group"
                    >
                        <img
                            src={item.backdrop || item.poster}
                            alt={item.titleAr || item.title}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md uppercase">قريباً</span>
                                <span className="text-white/60 text-xs font-bold">{item.year || '2026'}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.titleAr || item.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-1">{item.overview}</p>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleRemind(item)}
                                className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold transition-all"
                            >
                                ذكرني عند الصدور
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
