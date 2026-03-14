import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

const Carousel = ({ title, titleAr, movies, loading = false, link }) => {
    const scrollRef = useRef(null);
    const [isPaused, setIsPaused] = useState(false);

    const scroll = (direction) => {
        const container = scrollRef.current;
        if (container) {
            const scrollWidth = container.scrollWidth;
            const scrollLeft = Math.abs(container.scrollLeft);
            const clientWidth = container.clientWidth;
            const maxScroll = scrollWidth - clientWidth;

            // In RTL, "forward" is usually visually to the left, which means scrollLeft becomes more negative
            // But with Math.abs, it becomes more positive.

            if (direction === 'forward') {
                if (scrollLeft >= maxScroll - 5) {
                    container.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    const amount = container.offsetWidth * 0.8;
                    // For RTL, visually forward is scrolling LEFT
                    container.scrollBy({ left: -amount, behavior: 'smooth' });
                }
            } else if (direction === 'backward') {
                if (scrollLeft <= 5) {
                    // Go to end
                    container.scrollTo({ left: -maxScroll, behavior: 'smooth' });
                } else {
                    const amount = container.offsetWidth * 0.8;
                    // For RTL, visually backward is scrolling RIGHT
                    container.scrollBy({ left: amount, behavior: 'smooth' });
                }
            }
        }
    };

    useEffect(() => {
        if (!movies || movies.length === 0 || isPaused) return;

        const interval = setInterval(() => {
            scroll('forward');
        }, 4000); // Scroll every 4 seconds for better readability

        return () => clearInterval(interval);
    }, [movies, isPaused]);

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
                <Link to={link || '#'} className={`relative group ${!link && 'pointer-events-none'}`}>
                    <div className="flex items-baseline gap-4">
                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-arabic tracking-tight hover:text-yellow-400 transition-colors">
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
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-1.5 bg-yellow-400 rounded-full mt-3 transition-all"
                    />
                </Link>

                <div className="hidden sm:flex items-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => scroll('backward')}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-yellow-400 hover:text-black transition-all"
                    >
                        <MdChevronRight className="text-2xl lg:text-3xl" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => scroll('forward')}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white backdrop-blur-md hover:bg-yellow-400 hover:text-black transition-all"
                    >
                        <MdChevronLeft className="text-2xl lg:text-3xl" />
                    </motion.button>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative -mx-5 sm:-mx-6 lg:-mx-16">
                <div
                    ref={scrollRef}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto hide-scrollbar px-5 sm:px-6 lg:px-16 py-4"
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
