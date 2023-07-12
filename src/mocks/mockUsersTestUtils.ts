import { USERS_STORAGE_KEY } from './constants';
import { mockUsers } from './fixtures';

// This populates the mock database (i.e. the localStorage) with users during development
export function populateMockUsers() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers()));
    }
}

// This is the ownerId of 'test@owner.com' with a pw of 'arstneio' defined in mocks/fixtures.ts
export const testOwnerId = '640000000000000000000000';

export function setTestAccessTokenToLocalStorage() {
    localStorage.setItem('access_token', testOwnerId);
}

export function clearTestAccessTokenFromLocalStorage() {
    localStorage.removeItem('access_token');
}
