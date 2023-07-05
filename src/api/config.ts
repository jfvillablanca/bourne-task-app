import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
    // baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
    (config) => {
        return {
            ...config,
            // headers: {
            //   ...
            // },
        };
    },
    (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        // ...
        return Promise.reject(error.response);
    },
);

const { get, post, patch, delete: destroy } = apiClient;
export { destroy, get, patch, post };
