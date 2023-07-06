import { HttpStatusCode } from 'axios';
import { setupServer } from 'msw/node';
import { describe, it, vi } from 'vitest';

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
        const setItemMock = vi.spyOn(Storage.prototype, 'setItem');
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
        expect(setItemMock).toHaveBeenCalledWith(
            'access_token',
            generatedTokens?.access_token,
        );
        expect(setItemMock).toHaveBeenCalledWith(
            'refresh_token',
            generatedTokens?.refresh_token,
        );

        setItemMock.mockRestore();
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
            expect(result.current.error?.status).toBe(HttpStatusCode.Conflict);
            expect(result.current.error?.statusText).toBe(
                'Email is already taken',
            );
        });
    });

    it('should log a user in', async () => {
        const setItemMock = vi.spyOn(Storage.prototype, 'setItem');
        const user: AuthDto = {
            email: 'iam@teapot.com',
            password: 'swordfish',
        };
        const { result: registerResult } = renderHook(
            () => Auth.useRegisterLocal(),
            {
                wrapper: createWrapper(),
            },
        );
        registerResult.current.mutate(user);
        await waitFor(() => expect(registerResult.current.data).toBeDefined());

        const { result: loginResult } = renderHook(() => Auth.useLoginLocal(), {
            wrapper: createWrapper(),
        });
        loginResult.current.mutate(user);
        await waitFor(() => expect(loginResult.current.data).toBeDefined());

        const generatedTokens = loginResult.current.data;
        expect(generatedTokens?.access_token).toBeDefined();
        expect(generatedTokens?.refresh_token).toBeDefined();
        expect(setItemMock).toHaveBeenCalledWith(
            'access_token',
            generatedTokens?.access_token,
        );
        expect(setItemMock).toHaveBeenCalledWith(
            'refresh_token',
            generatedTokens?.refresh_token,
        );

        setItemMock.mockRestore();
    });

    it('should handle a 403 status code if user does not exist', async () => {
        const nonExistentUser: AuthDto = {
            email: 'iam@teapot.com',
            password: 'swordfish',
        };

        const { result } = renderHook(() => Auth.useLoginLocal(), {
            wrapper: createWrapper(),
        });

        result.current.mutate(nonExistentUser);

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(HttpStatusCode.Forbidden);
            expect(result.current.error?.statusText).toBe(
                'Invalid credentials: user does not exist',
            );
            expect(result.current.error?.type).toBe('user');
        });
    });

    it('should handle a 403 status code if password is invalid', async () => {
        const user: AuthDto = {
            email: 'iam@teapot.com',
            password: 'swordfish',
        };
        const userWithInvalidPassword: AuthDto = {
            ...user,
            password: 'blobfish',
        };

        const { result: registerResult } = renderHook(
            () => Auth.useRegisterLocal(),
            {
                wrapper: createWrapper(),
            },
        );
        registerResult.current.mutate(user);
        await waitFor(() => expect(registerResult.current.data).toBeDefined());

        const { result: loginResult } = renderHook(() => Auth.useLoginLocal(), {
            wrapper: createWrapper(),
        });
        loginResult.current.mutate(userWithInvalidPassword);

        await waitFor(() => {
            expect(loginResult.current.error).toBeDefined();
            expect(loginResult.current.error?.status).toBe(
                HttpStatusCode.Forbidden,
            );
            expect(loginResult.current.error?.statusText).toBe(
                'Invalid password',
            );
            expect(loginResult.current.error?.type).toBe('password');
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
