import { motion } from 'framer-motion';

const Skeleton = ({ className, variant = 'rect' }) => {
    const variants = {
        rect: 'rounded-xl',
        circle: 'rounded-full',
        text: 'rounded-md h-4 w-3/4'
    };

    return (
        <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className={`bg-white/5 overflow-hidden relative ${variants[variant]} ${className}`}
        >
            <motion.div
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
        </motion.div>
    );
};

export const CardSkeleton = () => (
    <div className="space-y-3">
        <Skeleton className="aspect-[2/3] w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-1/2" />
    </div>
);

export const SectionSkeleton = () => (
    <div className="py-8 px-4 md:px-12">
        <Skeleton variant="text" className="w-48 h-8 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
    </div>
);

export default Skeleton;
