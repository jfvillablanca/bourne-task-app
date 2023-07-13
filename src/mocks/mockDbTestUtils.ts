import { generateJwtToken } from '../lib/utils';

import { PROJECTS_STORAGE_KEY, USERS_STORAGE_KEY } from './constants';
import { mockProjects, mockUsers } from './fixtures';

// This populates the mock database (i.e. the localStorage) with users during development
export function populateMockDatabase() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers()));
    }
    if (!localStorage.getItem(PROJECTS_STORAGE_KEY)) {
        localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(mockProjects()),
        );
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
