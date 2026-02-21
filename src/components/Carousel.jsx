import { motion } from 'framer-motion';
import { useRef } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import MovieCard from './MovieCard';

const Carousel = ({ title, titleAr, movies, loading = false }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        const container = scrollRef.current;
        if (container) {
            const scrollAmount = direction === 'left' ? -container.offsetWidth * 0.8 : container.offsetWidth * 0.8;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mb-16 lg:mb-32 px-4 sm:px-6 lg:px-16 overflow-hidden"
        >
            {/* Unique Section Background Card */}
            <div className="absolute inset-0 bg-white/[0.015] dark:bg-white/[0.01] rounded-[2rem] sm:rounded-[3rem] border border-white/5 shadow-2xl pointer-events-none -mx-2 sm:-mx-4 lg:-mx-8 my-[-1rem] sm:my-[-2rem]" />

            {/* Asymmetric Decorative Element */}
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Header Section */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pt-4">
                <div className="relative">
                    {/* Modern Float Label */}
                    <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 0.6, x: 0 }}
                        className="block text-[10px] font-black uppercase tracking-[0.4em] text-yellow-500 mb-3 ml-1"
                    >
                        Trending Now
                    </motion.span>

                    <div className="flex items-baseline gap-3 sm:gap-4">
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-main font-arabic leading-tight drop-shadow-md">
                            {title}
                        </h2>
                        <span className="hidden md:block text-2xl font-light text-muted font-english opacity-30 italic">
                            / {titleAr}
                        </span>
                    </div>

                    {/* Unique Animated Underline */}
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '80%' }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-transparent rounded-full mt-4"
                    />
                </div>

                {/* Glass Navigation Controls */}
                <div className="hidden sm:flex items-center gap-4 self-end md:self-auto mb-1">
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,215,0,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => scroll('left')}
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-main backdrop-blur-2xl transition-all shadow-2xl hover:border-yellow-400/30"
                    >
                        <MdChevronLeft className="text-3xl lg:text-4xl" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,215,0,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => scroll('right')}
                        className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-main backdrop-blur-2xl transition-all shadow-2xl hover:border-yellow-400/30"
                    >
                        <MdChevronRight className="text-3xl lg:text-4xl" />
                    </motion.button>
                </div>
            </div>

            {/* Carousel Row Container */}
            <div className="relative group/carousel -mx-4 sm:-mx-6 lg:-mx-16">
                <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-6 lg:gap-10 overflow-x-auto hide-scrollbar px-5 sm:px-6 lg:px-16 py-6 scroll-smooth"
                >
                    {movies.length > 0 ? (
                        movies.map((movie, index) => (
                            <div key={movie.id || index} className="w-[160px] sm:w-72 flex-shrink-0">
                                <MovieCard movie={movie} />
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-[160px] sm:w-72 h-[240px] sm:h-[450px] rounded-2xl sm:rounded-[2rem] bg-white/5 animate-pulse flex-shrink-0" />
                        ))
                    )}
                </div>

                {/* Edge Fades for Cinematic Look */}
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-r from-site to-transparent pointer-events-none z-20" />
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 lg:w-48 bg-gradient-to-l from-site to-transparent pointer-events-none z-20" />
            </div>
        </motion.section>
    );
};

export default Carousel;
