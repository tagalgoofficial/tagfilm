import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('tagfilm_favorites');
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse favorites", e);
            }
        }
    }, []);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('tagfilm_favorites', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (item) => {
        setFavorites(prev => {
            const exists = prev.find(f => f.id === item.id);
            if (exists) {
                return prev.filter(f => f.id !== item.id);
            } else {
                // Store minimal info to render a card without extra fetches
                const minimalItem = {
                    id: item.id,
                    title: item.title,
                    titleAr: item.titleAr,
                    poster: item.poster,
                    rating: item.rating,
                    year: item.year,
                    quality: item.quality,
                    type: item.type || item._type || (item.seasons ? 'series' : 'movie')
                };
                return [...prev, minimalItem];
            }
        });
    };

    const isFavorite = (id) => favorites.some(f => f.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
