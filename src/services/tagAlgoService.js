import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.tagalgo.com',
    withCredentials: true // 👈 هذا السطر سحري ومهم جداً لنجاح الاتصال
});

export const getTagAlgoVideos = async () => {
    try {
        const response = await api.get('/api/dashboard/videos');
        return response.data;
    } catch (error) {
        console.error('Error fetching TagAlgo videos:', error);
        throw error;
    }
};

export const getTagAlgoSecureUrl = async (tagAlgoPlayUrl) => {
    try {
        const response = await api.get(tagAlgoPlayUrl);
        if (response.data && response.data.secureUrl) {
            return response.data.secureUrl;
        }
        throw new Error('secureUrl not found in response');
    } catch (error) {
        console.error('Error fetching secure token for video:', error);
        throw error;
    }
};
