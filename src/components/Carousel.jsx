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
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="relative mb-20 lg:mb-32 px-5 sm:px-6 lg:px-16"
        >
            {/* Header Section */}
            <div className="relative z-10 flex items-end justify-between gap-6 mb-8">
                <div className="relative group">
                    <div className="flex items-baseline gap-4">
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-arabic tracking-tight">
                            {title}
                        </h2>
                        {titleAr && (
                            <span className="hidden md:block text-xl font-medium text-gray-500 font-english opacity-40 lowercase">
                                / {titleAr}
                            </span>
                        )}
                    </div>

                    {/* Minimalist Animated Underline */}
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '40px' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-1.5 bg-yellow-400 rounded-full mt-3 group-hover:width-[60px] transition-all"
                    />
                </div>

                {/* Navigation Controls */}
                <div className="hidden sm:flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => scroll('left')}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-yellow-400 hover:text-black transition-all"
                    >
                        <MdChevronLeft className="text-2xl lg:text-3xl" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => scroll('right')}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-yellow-400 hover:text-black transition-all"
                    >
                        <MdChevronRight className="text-2xl lg:text-3xl" />
                    </motion.button>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative -mx-5 sm:-mx-6 lg:-mx-16">
                <div
                    ref={scrollRef}
                    className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto hide-scrollbar px-5 sm:px-6 lg:px-16 py-4 scroll-smooth"
                >
                    {movies.length > 0 ? (
                        movies.map((movie, index) => (
                            <div key={movie.id || index} className="w-[150px] sm:w-[280px] flex-shrink-0">
                                <MovieCard movie={movie} />
                            </div>
                        ))
                    ) : (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="w-[150px] sm:w-[280px] aspect-[2/3] rounded-3xl bg-white/5 animate-pulse flex-shrink-0" />
                        ))
                    )}
                </div>

                {/* Cinematic Grade Fades */}
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#050514] to-transparent pointer-events-none z-20" />
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#050514] to-transparent pointer-events-none z-20" />
            </div>
        </motion.section>
    );
};

export default Carousel;
