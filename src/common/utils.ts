import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';

import { decodeToken } from '../lib/utils';

export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export function expirationDate(access_token: string) {
    return secondsToMilliseconds(decodeToken(access_token).exp);
}

export function secondsBeforeExpiration(access_token: string) {
    return millisecondsToSeconds(expirationDate(access_token) - Date.now());
}
