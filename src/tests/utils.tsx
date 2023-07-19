import { jwtVerify, SignJWT } from 'jose';
import { ReactNode } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import { createQueryClient, MockedUser } from '../common';
import {
    JWT_SECRET,
    PROJECTS_STORAGE_KEY,
    USERS_STORAGE_KEY,
} from '../mocks/constants';
import { mockProjects, mockUsers } from '../mocks/fixtures';

const createTestQueryClient = () =>
    createQueryClient({
        logger: {
            /* eslint-disable no-console*/
            log: console.log,
            warn: console.warn,
            error: process.env.NODE_ENV === 'test' ? () => {} : console.error,
            /* eslint-enable no-console*/
        },
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

// Used for hooks testing
export function createWrapper() {
    const testQueryClient = createTestQueryClient();
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={testQueryClient}>
            {children}
        </QueryClientProvider>
    );
}

// Used for component testing
export function renderWithClient(ui: React.ReactElement) {
    const testQueryClient = createTestQueryClient();
    const { rerender, ...result } = render(
        <QueryClientProvider client={testQueryClient}>
            {ui}
        </QueryClientProvider>,
    );
    return {
        ...result,
        rerender: (rerenderUi: React.ReactElement) =>
            rerender(
                <QueryClientProvider client={testQueryClient}>
                    {rerenderUi}
                </QueryClientProvider>,
            ),
    };
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.sub;
    } catch (err) {
        return;
    }
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
