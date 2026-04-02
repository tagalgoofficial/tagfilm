/**
 * Converts a title into a safe Firebase Document ID (Slug).
 * Supports Arabic and English characters.
 */
export const slugify = (text) => {
    if (!text) return `id_${Date.now()}`;

    return text
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/\//g, '-')            // Replace slashes with - (Firebase forbidden)
        .replace(/[^\u0600-\u06FFa-z0-9\-]/g, '') // Keep Arabic chars, Alphanumeric, and Hyphen
        .replace(/-+/g, '-')           // Replace multiple hyphens with single hyphen
        .replace(/^-+/, '')             // Trim start hyphens
        .replace(/-+$/, '');            // Trim end hyphens
};
