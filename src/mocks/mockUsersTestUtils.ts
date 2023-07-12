import { generateJwtToken } from '../lib/utils';

import { USERS_STORAGE_KEY } from './constants';
import { mockUsers } from './fixtures';

// This populates the mock database (i.e. the localStorage) with users during development
export function populateMockUsers() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers()));
    }
}

// This is the set owner for all mock projects
export const testOwner = {
    _id: '640000000000000000000000',
    email: 'test@owner.com',
    password: 'arstneio',
};

export async function setTestAccessTokenToLocalStorage() {
    localStorage.setItem(
        'access_token',
        await generateJwtToken(
            { _id: testOwner._id, email: testOwner.email },
            'access_token',
        ),
    );
}

export function clearTestAccessTokenFromLocalStorage() {
    localStorage.removeItem('access_token');
}
