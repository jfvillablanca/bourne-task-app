import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { AuthToken } from '../common';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const tokenStorage = {
    getToken: (tokenType: keyof AuthToken) => localStorage.getItem(tokenType),
    setToken: (tokens: AuthToken): void => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
    },
    setTokenByKey: (tokenType: keyof AuthToken, token: string): void => {
        localStorage.setItem(tokenType, token);
    },
    clearToken: (tokenType: keyof AuthToken) =>
        localStorage.removeItem(tokenType),
};
