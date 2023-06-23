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

    it('should findOne project of a user', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const { result } = renderHook(() => Project.useFindOne(mockProjectId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.data).toBeDefined());
        const project = result.current.data;

        expect(project?._id).toBe(mockProjectId);
    });

    it('should update project of a user', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const updatedDescription = 'new description';
        const { result: useMutationResult } = renderHook(
            () => Project.useUpdate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        useMutationResult.current.mutate({ description: updatedDescription });
        await waitFor(() =>
            expect(useMutationResult.current.data).toBeDefined(),
        );
        // Expect that PATCH returns the updated document
        expect(useMutationResult.current.data?.description).toBe(
            updatedDescription,
        );

        const { result: useQueryResult } = renderHook(
            () => Project.useFindOne(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );
        await waitFor(() => expect(useQueryResult.current.data).toBeDefined());
        // Expect that the updated document is actually saved in DB
        expect(useQueryResult.current.data?.description).toBe(
            updatedDescription,
        );
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
