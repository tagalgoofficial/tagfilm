/**
 * apiMovieService.js
 * -------------------
 * "Endpoint" داخلي يشتغل كـ API:
 *   POST /add-movie  →  { movieName, m3u8Url, [language] }
 *
 * الخطوات:
 *   1. يبحث عن الفيلم في TMDB بالاسم
 *   2. يجلب التفاصيل الكاملة (بوستر، قصة، ممثلين …)
 *   3. يحفظ كل شيء في Firestore داخل كولكشن "movies"
 */

import axios from 'axios';
import { addMovie } from '../firebase/moviesService';

// ─── إعدادات TMDB ─────────────────────────────────────────────────────────────
const TMDB_API_KEY = '032908ce19a743b7c5b96eda01c436b6';
const TMDB_BASE    = 'https://api.themoviedb.org/3';
const IMG_W500     = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIG     = 'https://image.tmdb.org/t/p/original';

// ─── دوال مساعدة TMDB ─────────────────────────────────────────────────────────

/** البحث عن فيلم بالاسم، يرجع أول نتيجة أو null */
const searchMovie = async (name, language = 'ar') => {
    const res = await axios.get(`${TMDB_BASE}/search/movie`, {
        params: { api_key: TMDB_API_KEY, query: name, language },
    });
    return res.data.results?.[0] ?? null;
};

/** جلب تفاصيل فيلم كاملة (تفاصيل + ممثلين + لوجو) */
const fetchMovieDetails = async (tmdbId, language = 'ar') => {
    const [detailsRes, creditsRes, imagesRes] = await Promise.all([
        axios.get(`${TMDB_BASE}/movie/${tmdbId}`, {
            params: { api_key: TMDB_API_KEY, language },
        }),
        axios.get(`${TMDB_BASE}/movie/${tmdbId}/credits`, {
            params: { api_key: TMDB_API_KEY, language },
        }),
        axios.get(`${TMDB_BASE}/movie/${tmdbId}/images`, {
            params: { api_key: TMDB_API_KEY },
        }),
    ]);

    const movie = detailsRes.data;

    const cast = (creditsRes.data.cast ?? []).slice(0, 10).map(actor => ({
        id:        actor.id,
        name:      actor.name,
        character: actor.character,
        photo:     actor.profile_path ? `${IMG_W500}${actor.profile_path}` : null,
    }));

    const logos   = imagesRes.data.logos ?? [];
    const bestLogo = logos.find(l => l.iso_639_1 === 'en') || logos[0];

    return {
        tmdbId:    movie.id,
        title:     movie.title,
        titleAr:   movie.title,
        titleEn:   movie.original_title,
        overview:  movie.overview,
        poster:    movie.poster_path  ? `${IMG_W500}${movie.poster_path}`   : null,
        backdrop:  movie.backdrop_path? `${IMG_ORIG}${movie.backdrop_path}` : null,
        logo:      bestLogo           ? `${IMG_ORIG}${bestLogo.file_path}`  : null,
        year:      movie.release_date?.split('-')[0] ?? '',
        rating:    movie.vote_average?.toFixed(1)    ?? '0',
        duration:  movie.runtime
            ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
            : '',
        genres: (movie.genres ?? []).map(g => g.name),
        cast,
    };
};

// ─── الـ "Endpoint" الرئيسي ────────────────────────────────────────────────────

/**
 * addMovieByName
 * --------------
 * يعادل: POST /api/add-movie
 *
 * @param {Object} body
 * @param {string} body.movieName   - اسم الفيلم (مطلوب)
 * @param {string} body.m3u8Url    - رابط البث (مطلوب)
 * @param {string} [body.language] - لغة TMDB (افتراضي: 'ar')
 *
 * @returns {{ success: boolean, movieId?: string, data?: object, error?: string }}
 */
export const addMovieByName = async ({ movieName, m3u8Url, language = 'ar' }) => {
    // ── التحقق من المدخلات ──────────────────────────────────────────────────────
    if (!movieName?.trim()) {
        return { success: false, error: 'اسم الفيلم مطلوب' };
    }
    if (!m3u8Url?.trim()) {
        return { success: false, error: 'رابط m3u8 مطلوب' };
    }

    try {
        // ── الخطوة 1: البحث في TMDB ────────────────────────────────────────────
        const searchResult = await searchMovie(movieName.trim(), language);

        if (!searchResult) {
            return {
                success: false,
                error:   `لم يتم العثور على فيلم باسم "${movieName}" في TMDB`,
            };
        }

        // ── الخطوة 2: جلب التفاصيل الكاملة ───────────────────────────────────
        const tmdbData = await fetchMovieDetails(searchResult.id, language);

        // ── الخطوة 3: تجميع بيانات الفيلم ────────────────────────────────────
        const movieData = {
            ...tmdbData,
            m3u8Url: m3u8Url.trim(),
            // الجزء الأول = رابط m3u8 المُرسَل
            parts: [
                {
                    id:     `part_${Date.now()}`,
                    label:  'الجزء الكامل',
                    m3u8Url: m3u8Url.trim(),
                },
            ],
            type:   'movie',
            status: 'published',
        };

        // ── الخطوة 4: الحفظ في Firestore ──────────────────────────────────────
        const movieId = await addMovie(movieData);

        return {
            success: true,
            movieId,
            data:    movieData,
        };

    } catch (err) {
        console.error('[addMovieByName] Error:', err);
        return {
            success: false,
            error:   err?.response?.data?.status_message ?? err.message ?? 'خطأ غير متوقع',
        };
    }
};
