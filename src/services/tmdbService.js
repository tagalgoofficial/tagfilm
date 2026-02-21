import axios from 'axios';

const API_KEY = '032908ce19a743b7c5b96eda01c436b6';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

// البحث عن أفلام
export const searchMovies = async (query) => {
    const res = await axios.get(`${BASE_URL}/search/movie`, {
        params: { api_key: API_KEY, query, language: 'ar' }
    });
    return res.data.results.map(m => ({
        ...m,
        poster_url: m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : null,
        backdrop_url: m.backdrop_path ? `${BACKDROP_BASE}${m.backdrop_path}` : null,
    }));
};

// البحث عن مسلسلات
export const searchSeries = async (query) => {
    const res = await axios.get(`${BASE_URL}/search/tv`, {
        params: { api_key: API_KEY, query, language: 'ar' }
    });
    return res.data.results.map(s => ({
        ...s,
        poster_url: s.poster_path ? `${IMAGE_BASE}${s.poster_path}` : null,
        backdrop_url: s.backdrop_path ? `${BACKDROP_BASE}${s.backdrop_path}` : null,
    }));
};

// جلب تفاصيل فيلم كاملة مع الممثلين
export const getMovieDetails = async (movieId) => {
    const [detailsRes, creditsRes] = await Promise.all([
        axios.get(`${BASE_URL}/movie/${movieId}`, {
            params: { api_key: API_KEY, language: 'ar' }
        }),
        axios.get(`${BASE_URL}/movie/${movieId}/credits`, {
            params: { api_key: API_KEY, language: 'ar' }
        })
    ]);

    const movie = detailsRes.data;
    const cast = creditsRes.data.cast.slice(0, 10).map(actor => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path ? `${IMAGE_BASE}${actor.profile_path}` : null,
    }));

    return {
        tmdbId: movie.id,
        title: movie.title,
        titleAr: movie.title,
        titleEn: movie.original_title,
        overview: movie.overview,
        poster: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `${BACKDROP_BASE}${movie.backdrop_path}` : null,
        year: movie.release_date?.split('-')[0] || '',
        rating: movie.vote_average?.toFixed(1) || '0',
        duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '',
        genres: movie.genres?.map(g => g.name) || [],
        cast,
    };
};

// جلب تفاصيل مسلسل كاملة مع الممثلين
export const getSeriesDetails = async (seriesId) => {
    const [detailsRes, creditsRes] = await Promise.all([
        axios.get(`${BASE_URL}/tv/${seriesId}`, {
            params: { api_key: API_KEY, language: 'ar' }
        }),
        axios.get(`${BASE_URL}/tv/${seriesId}/credits`, {
            params: { api_key: API_KEY, language: 'ar' }
        })
    ]);

    const series = detailsRes.data;
    const cast = creditsRes.data.cast.slice(0, 10).map(actor => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path ? `${IMAGE_BASE}${actor.profile_path}` : null,
    }));

    return {
        tmdbId: series.id,
        title: series.name,
        titleAr: series.name,
        titleEn: series.original_name,
        overview: series.overview,
        poster: series.poster_path ? `${IMAGE_BASE}${series.poster_path}` : null,
        backdrop: series.backdrop_path ? `${BACKDROP_BASE}${series.backdrop_path}` : null,
        year: series.first_air_date?.split('-')[0] || '',
        rating: series.vote_average?.toFixed(1) || '0',
        seasonsCount: series.number_of_seasons || 0,
        episodesCount: series.number_of_episodes || 0,
        genres: series.genres?.map(g => g.name) || [],
        cast,
        seasons: series.seasons?.map(s => ({
            seasonNumber: s.season_number,
            name: s.name,
            episodeCount: s.episode_count,
            poster: s.poster_path ? `${IMAGE_BASE}${s.poster_path}` : null,
        })) || [],
    };
};

// جلب حلقات موسم معين
export const getSeasonEpisodes = async (seriesId, seasonNumber) => {
    const res = await axios.get(`${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`, {
        params: { api_key: API_KEY, language: 'ar' }
    });
    return res.data.episodes.map(ep => ({
        episodeNumber: ep.episode_number,
        name: ep.name,
        overview: ep.overview,
        still: ep.still_path ? `${IMAGE_BASE}${ep.still_path}` : null,
        airDate: ep.air_date,
        runtime: ep.runtime,
    }));
};
