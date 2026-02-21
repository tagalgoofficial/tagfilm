import { motion } from 'framer-motion';

const SkeletonCard = () => {
    return (
        <div className="flex-shrink-0 w-64">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse">
                {/* Skeleton Poster */}
                <div className="aspect-[2/3] bg-gray-700/30" />

                {/* Skeleton Info */}
                <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-700/50 rounded w-3/4" />
                    <div className="h-4 bg-gray-700/30 rounded w-1/2" />
                    <div className="h-3 bg-gray-700/20 rounded w-2/3" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
