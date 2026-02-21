import { motion } from 'framer-motion';

const TopFilters = () => {
    const filters = [
        { id: 1, label: 'مضاف حديثاً', labelEn: 'Recently Added', active: true },
        { id: 2, label: 'تريند', labelEn: 'Trending', active: false },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="container mx-auto px-6 py-8"
        >
            <div className="flex items-center gap-6 flex-wrap">
                {filters.map((filter, index) => (
                    <motion.button
                        key={filter.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-8 py-3 rounded-full font-medium transition-all duration-300 border-2 font-arabic text-lg
              ${filter.active
                                ? 'bg-accent-gold text-black border-accent-gold shadow-lg shadow-accent-gold/50'
                                : 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-accent-gold/50'
                            }`}
                    >
                        <span className="ml-2">{filter.label}</span>
                        <span className="text-sm opacity-70">({filter.labelEn})</span>
                    </motion.button>
                ))}
            </div>
        </motion.div>
    );
};

export default TopFilters;
