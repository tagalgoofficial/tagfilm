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
    const [detailsRes, creditsRes, imagesRes] = await Promise.all([
        axios.get(`${BASE_URL}/movie/${movieId}`, {
            params: { api_key: API_KEY, language: 'ar', append_to_response: 'videos', include_video_language: 'ar,en' }
        }),
        axios.get(`${BASE_URL}/movie/${movieId}/credits`, {
            params: { api_key: API_KEY, language: 'ar' }
        }),
        axios.get(`${BASE_URL}/movie/${movieId}/images`, {
            params: { api_key: API_KEY }
        })
    ]);

    const movie = detailsRes.data;
    const cast = creditsRes.data.cast.slice(0, 10).map(actor => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path ? `${IMAGE_BASE}${actor.profile_path}` : null,
    }));

    // استخراج اللوجو (يفضل الإنجليزي أو بدون لغة)
    const logos = imagesRes.data.logos || [];
    const bestLogo = logos.find(l => l.iso_639_1 === 'en') || logos[0];
    const logoUrl = bestLogo ? `${BACKDROP_BASE}${bestLogo.file_path}` : null;

    // استخراج التريلر (يفضل YouTube وبحث عن Trailer)
    const videos = movie.videos?.results || [];
    const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    return {
        tmdbId: movie.id,
        title: movie.title,
        titleAr: movie.title,
        titleEn: movie.original_title,
        overview: movie.overview,
        metatags: movie.genres?.map(g => g.name).join(', ') || '',
        poster: movie.poster_path ? `${IMAGE_BASE}${movie.poster_path}` : null,
        backdrop: movie.backdrop_path ? `${BACKDROP_BASE}${movie.backdrop_path}` : null,
        logo: logoUrl,
        year: movie.release_date?.split('-')[0] || '',
        rating: movie.vote_average?.toFixed(1) || '0',
        duration: movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '',
        genres: movie.genres?.map(g => g.name) || [],
        trailer: trailerUrl,
        cast,
    };
};

// جلب تفاصيل مسلسل كاملة مع الممثلين
export const getSeriesDetails = async (seriesId) => {
    const [detailsRes, creditsRes, imagesRes] = await Promise.all([
        axios.get(`${BASE_URL}/tv/${seriesId}`, {
            params: { api_key: API_KEY, language: 'ar', append_to_response: 'videos', include_video_language: 'ar,en' }
        }),
        axios.get(`${BASE_URL}/tv/${seriesId}/credits`, {
            params: { api_key: API_KEY, language: 'ar' }
        }),
        axios.get(`${BASE_URL}/tv/${seriesId}/images`, {
            params: { api_key: API_KEY }
        })
    ]);

    const series = detailsRes.data;
    const cast = creditsRes.data.cast.slice(0, 10).map(actor => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        photo: actor.profile_path ? `${IMAGE_BASE}${actor.profile_path}` : null,
    }));

    // استخراج اللوجو
    const logos = imagesRes.data.logos || [];
    const bestLogo = logos.find(l => l.iso_639_1 === 'en') || logos[0];
    const logoUrl = bestLogo ? `${BACKDROP_BASE}${bestLogo.file_path}` : null;

    // استخراج التريلر
    const videos = series.videos?.results || [];
    const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) || videos[0];
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    return {
        tmdbId: series.id,
        title: series.name,
        titleAr: series.name,
        titleEn: series.original_name,
        overview: series.overview,
        metatags: series.genres?.map(g => g.name).join(', ') || '',
        poster: series.poster_path ? `${IMAGE_BASE}${series.poster_path}` : null,
        backdrop: series.backdrop_path ? `${BACKDROP_BASE}${series.backdrop_path}` : null,
        logo: logoUrl,
        year: series.first_air_date?.split('-')[0] || '',
        rating: series.vote_average?.toFixed(1) || '0',
        seasonsCount: series.number_of_seasons || 0,
        episodesCount: series.number_of_episodes || 0,
        genres: series.genres?.map(g => g.name) || [],
        trailer: trailerUrl,
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
