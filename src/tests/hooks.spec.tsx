import { HttpStatusCode } from 'axios';
import { setupServer } from 'msw/node';
import { describe, it } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { Auth, Project, Task } from '../api';
import { AuthDto } from '../common';
import { mockProjects } from '../mocks/fixtures';
import { handlers } from '../mocks/handlers';

import { createWrapper } from './utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());

afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
});

afterAll(() => server.close());

describe('Auth', () => {
    it('should create a new user', async () => {
        const newUser: AuthDto = {
            email: 'iam@teapot.com',
            password: 'swordfish',
        };
        const { result } = renderHook(() => Auth.useRegisterLocal(), {
            wrapper: createWrapper(),
        });

        result.current.mutate(newUser);

        await waitFor(() => expect(result.current.data).toBeDefined());
        const generatedTokens = result.current.data;
        expect(generatedTokens?.access_token).toBeDefined();
        expect(generatedTokens?.refresh_token).toBeDefined();
    });

    it('should handle a 409 status code if email is already taken', async () => {
        const newUser: AuthDto = {
            email: 'iam@teapot.com',
            password: 'swordfish',
        };

        const duplicateUser: AuthDto = {
            email: 'iam@teapot.com',
            password: 'blobfish',
        };

        const { result } = renderHook(() => Auth.useRegisterLocal(), {
            wrapper: createWrapper(),
        });

        result.current.mutate(newUser);
        await waitFor(() => expect(result.current.data).toBeDefined());
        result.current.mutate(duplicateUser);

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.response?.status).toBe(
                HttpStatusCode.Conflict,
            );
            expect(result.current.error?.response?.statusText).toBe(
                'Email is already taken',
            );
        });
    });
});

describe('Project - Create', () => {
    it('should create a new project', async () => {
        const newProjectTitle = 'new project';
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });

        createResult.current.mutate({ title: newProjectTitle });

        await waitFor(() => expect(createResult.current.data).toBeDefined());
        expect(createResult.current.data?.title).toBe(newProjectTitle);
    });
});

describe.concurrent('Project', () => {
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

    it('should get project members', async () => {
        const mockProject = mockProjects()[0];
        const mockProjectId = mockProject._id;
        const mockProjectMembers = [
            mockProject.ownerId,
            ...mockProject.collaborators,
        ];
        const { result } = renderHook(
            () => Project.useGetProjectMembers(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => expect(result.current.data).toBeDefined());
        const projectMembers = result.current.data?.map((member) => member._id);

        expect(projectMembers).toStrictEqual(mockProjectMembers);
    });

    it('should update project of a user', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const updatedDescription = 'new description';
        const { result: updateResult } = renderHook(
            () => Project.useUpdate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        updateResult.current.mutate({ description: updatedDescription });
        await waitFor(() => expect(updateResult.current.data).toBeDefined());
        // Expect that PATCH returns the updated document
        expect(updateResult.current.data?.description).toBe(updatedDescription);
    });
});

describe.concurrent('Task', () => {
    it('should create new task', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockTaskState = mockProjects()[0].taskStates[0];
        const newTaskTitle = 'new task title';
        const { result: createResult } = renderHook(
            () => Task.useCreate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        createResult.current.mutate({
            title: newTaskTitle,
            taskState: mockTaskState,
        });
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        // Expect that CREATE returns the created document
        expect(createResult.current.data?.title).toBe(newTaskTitle);
    });

    it('should findAll tasks of a user', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const { result } = renderHook(() => Task.useFindAll(mockProjectId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.data).toBeDefined());
        const tasks = result.current.data;

        expect(tasks).toHaveLength(4);
    });

    it('should findOne task of a project', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockTaskId = mockProjects()[0].tasks[0]._id;
        const { result } = renderHook(
            () => Task.useFindOne(mockProjectId, mockTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => expect(result.current.data).toBeDefined());
        const task = result.current.data;

        expect(task?._id).toBe(mockTaskId);
    });

    it('should update task', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockTaskId = mockProjects()[0].tasks[0]._id;
        const updatedTaskDescription = 'new task description';
        const { result: updateResult } = renderHook(
            () => Task.useUpdate(mockProjectId, mockTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        updateResult.current.mutate({
            description: updatedTaskDescription,
        });
        await waitFor(() => expect(updateResult.current.data).toBeDefined());
        // Expect that PATCH returns the updated document
        expect(updateResult.current.data?.description).toBe(
            updatedTaskDescription,
        );
    });
});
