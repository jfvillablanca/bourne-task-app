import { setupServer } from 'msw/node';

import { renderHook, waitFor } from '@testing-library/react';

import { Project } from '../api';
import { handlers } from '../mocks/handlers';

import { createWrapper } from './utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('Project', () => {
    it('should findAll projects of a user', async () => {
        const { result } = renderHook(() => Project.useFindAll(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.data).toBeDefined());

        expect(result.current.data).toHaveLength(5);
    });
});
