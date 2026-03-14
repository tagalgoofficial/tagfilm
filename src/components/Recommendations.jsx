import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMovies } from '../firebase/moviesService';
import { getSeries } from '../firebase/seriesService';
import Carousel from './Carousel';

export default function Recommendations() {
    const { activeProfile } = useAuth();
    const [recommended, setRecommended] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!activeProfile || !activeProfile.categories) {
                setLoading(false);
                return;
            }

            try {
                const [movies, series] = await Promise.all([getMovies(), getSeries()]);
                const allMedia = [...movies, ...series];

                // Simple logic: filter items that match at least one of the profile's favorite categories
                const filtered = allMedia.filter(item => {
                    if (!item.categories) return false;
                    return item.categories.some(catId => activeProfile.categories.includes(catId));
                });

                // Shuffle and take top 15
                const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 15);
                setRecommended(shuffled);
            } catch (error) {
                console.error("Error fetching recommendations:", error);
            }
            setLoading(false);
        };

        fetchRecommendations();
    }, [activeProfile]);

    if (loading || (!loading && recommended.length === 0)) return null;

    return (
        <div className="animate-fadeIn">
            <Carousel
                title="لأنك تحب"
                titleAr="Based on your interests"
                movies={recommended}
                loading={false}
            />
        </div>
    );
}
