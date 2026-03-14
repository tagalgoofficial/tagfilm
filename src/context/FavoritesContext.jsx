import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const { user } = useAuth();
    const [isFirstSync, setIsFirstSync] = useState(true);

    // 1. Initial Load from localStorage
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

    // 2. Sync with Firestore when User Logs In
    useEffect(() => {
        const syncFavorites = async () => {
            if (!user) return;

            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);

                let cloudFavorites = [];
                if (userSnap.exists()) {
                    cloudFavorites = userSnap.data().favorites || [];
                }

                // Merge local favorites with cloud favorites on first sync
                if (isFirstSync) {
                    const localFavorites = JSON.parse(localStorage.getItem('tagfilm_favorites') || '[]');
                    const merged = [...cloudFavorites];

                    localFavorites.forEach(localItem => {
                        if (!merged.some(cloudItem => cloudItem.id === localItem.id)) {
                            merged.push(localItem);
                        }
                    });

                    setFavorites(merged);
                    await setDoc(userRef, { favorites: merged }, { merge: true });
                    setIsFirstSync(false);
                } else {
                    setFavorites(cloudFavorites);
                }
            } catch (error) {
                console.error("Error syncing favorites:", error);
            }
        };

        syncFavorites();
    }, [user, isFirstSync]);

    // 3. Save to localStorage and Firestore whenever favorites change
    useEffect(() => {
        localStorage.setItem('tagfilm_favorites', JSON.stringify(favorites));

        const updateCloud = async () => {
            if (user && !isFirstSync) {
                try {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, { favorites });
                } catch (error) {
                    console.error("Error updating cloud favorites:", error);
                }
            }
        };

        updateCloud();
    }, [favorites, user, isFirstSync]);

    const toggleFavorite = async (item) => {
        const exists = favorites.find(f => f.id === item.id);

        let newFavorites;
        if (exists) {
            newFavorites = favorites.filter(f => f.id !== item.id);
        } else {
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
            newFavorites = [...favorites, minimalItem];
        }

        setFavorites(newFavorites);
    };

    const isFavorite = (id) => favorites.some(f => f.id === id);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
