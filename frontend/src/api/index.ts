import config from '@/config';
import axios from 'axios';

export const userApi = axios.create({
    baseURL: `${config.backendUrl}/api/user`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});