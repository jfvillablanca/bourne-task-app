import { ClassValue, clsx } from 'clsx';
import jwtDecode from 'jwt-decode';
import { twMerge } from 'tailwind-merge';

import { AuthToken, DecodedToken } from '../common';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const tokenStorage = {
    getToken: (tokenType: keyof AuthToken) => localStorage.getItem(tokenType),
    setTokens: (tokens: AuthToken): void => {
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
    },
    setTokenByKey: (tokenType: keyof AuthToken, token: string): void => {
        localStorage.setItem(tokenType, token);
    },
    clearTokens: (): void => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
    clearTokenByKey: (tokenType: keyof AuthToken) =>
        localStorage.removeItem(tokenType),
};

export function decodeToken(token: string): DecodedToken {
    return jwtDecode(token);
}

const diceBearArtStyle = [
    'pixel-art',
    'lorelei',
    'adventurer',
    'big-smile',
    'identicon',
];

export const generateAvatarURL = (seed: string) =>
    `https://api.dicebear.com/6.x/${diceBearArtStyle[1]}/svg?seed=${seed}`;
