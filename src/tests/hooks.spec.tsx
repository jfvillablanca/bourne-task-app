import { setupServer } from 'msw/node';

import { renderHook, waitFor } from '@testing-library/react';

import { Project, Task } from '../api';
import { mockProjects } from '../mocks/fixtures';
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
        const projects = result.current.data;

        expect(projects).toHaveLength(5);
    });
});

describe('Task', () => {
    it('should findAll projects of a user', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const { result } = renderHook(() => Task.useFindAll(mockProjectId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.data).toBeDefined());
        const tasks = result.current.data;

        expect(tasks).toHaveLength(4);
    });
});
