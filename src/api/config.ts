import axios, { AxiosError } from 'axios';

import { tokenStorage } from '../lib/utils';

const apiClient = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = tokenStorage.getToken('access_token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        return Promise.reject(error.response);
    },
);

const { get, post, patch, delete: destroy } = apiClient;
export { destroy, get, patch, post };
