import { ClassValue, clsx } from 'clsx';
import { SignJWT } from 'jose';
import jwtDecode from 'jwt-decode';
import { twMerge } from 'tailwind-merge';

import { AuthToken, DecodedToken, MockedUser } from '../common';
import { JWT_SECRET } from '../mocks/constants';

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

export async function generateJwtToken(
    payload: Pick<MockedUser, '_id' | 'email'>,
    type: 'access_token' | 'refresh_token',
): Promise<string>;
export async function generateJwtToken(
    payload: Pick<MockedUser, '_id' | 'email'>,
    expiresIn: string,
): Promise<string>;
export async function generateJwtToken(
    payload: Pick<MockedUser, '_id' | 'email'>,
    arg2: 'access_token' | 'refresh_token' | string,
) {
    const jwtPayload = { sub: payload._id, email: payload.email };
    const signedJwt = await new SignJWT({ ...jwtPayload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(
            arg2 === 'access_token'
                ? '15m'
                : arg2 === 'refresh_token'
                ? '7d'
                : arg2,
        )
        .sign(JWT_SECRET);
    return signedJwt;
}
