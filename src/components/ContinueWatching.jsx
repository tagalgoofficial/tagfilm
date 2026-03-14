import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function ContinueWatching() {
    const { user, activeProfile } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user || !activeProfile) return;

            try {
                const historyRef = collection(db, 'users', user.uid, 'watchHistory');
                const q = query(
                    historyRef,
                    where('finished', '==', false),
                    orderBy('lastWatched', 'desc'),
                    limit(10)
                );

                const querySnapshot = await getDocs(q);
                const docs = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setHistory(docs);
            } catch (error) {
                console.error("Error fetching watch history:", error);
            }
            setLoading(false);
        };

        fetchHistory();
    }, [user, activeProfile]);

    if (loading || history.length === 0) return null;

    return (
        <div className="py-8 animate-fadeIn" dir="rtl">
            <h2 className="text-2xl font-bold text-white mb-6 px-4 md:px-12 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                أكمل المشاهدة
            </h2>

            <div className="flex gap-4 overflow-x-auto px-4 md:px-12 pb-4 no-scrollbar scroll-smooth">
                {history.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        className="flex-none w-64 md:w-72 relative rounded-xl overflow-hidden bg-white/5 border border-white/10 group"
                    >
                        <Link to={`/${item.mediaType}/${item.mediaId}`}>
                            <div className="aspect-video relative">
                                <img
                                    src={item.poster}
                                    alt={item.title}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white ml-1">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                    <div
                                        className="h-full bg-blue-600"
                                        style={{ width: `${(item.progress / item.duration) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-3">
                                <h3 className="text-white font-bold text-sm truncate">{item.title}</h3>
                                <p className="text-gray-400 text-xs mt-1">
                                    تبقى {Math.round((item.duration - item.progress) / 60)} دقيقة
                                </p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
