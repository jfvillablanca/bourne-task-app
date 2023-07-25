import { AxiosError, HttpStatusCode } from 'axios';
import ObjectID from 'bson-objectid';
import { setupServer } from 'msw/node';
import { describe, it, vi } from 'vitest';

import { renderHook, waitFor } from '@testing-library/react';

import { Auth, Project, Task } from '../api';
import { AuthDto, ProjectDto, ProjectMember } from '../common';
import { mockProjects } from '../mocks/fixtures';
import { handlers } from '../mocks/handlers';
import {
    clearTestAccessTokenFromLocalStorage,
    createWrapper,
    generateJwtToken,
    populateMockDatabase,
    setTestAccessTokenToLocalStorage,
    verifyToken,
} from '../tests/utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());

beforeEach(() => {
    populateMockDatabase();
});

afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
});

afterAll(() => server.close());

describe.shuffle('Auth', () => {
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
        const registeredUser = result.current.data;
        expect(registeredUser?._id).toBeDefined();
        expect(registeredUser?.email).toBeDefined();
        expect(setItemMock).toHaveBeenCalled();

        setItemMock.mockRestore();
    });

    it('should log a user in', async () => {
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
        const setItemMock = vi.spyOn(Storage.prototype, 'setItem');

        const { result: loginResult } = renderHook(() => Auth.useLoginLocal(), {
            wrapper: createWrapper(),
        });
        loginResult.current.mutate(user);
        await waitFor(() => expect(loginResult.current.data).toBeDefined());

        const loggedInUser = loginResult.current.data;
        expect(loggedInUser?._id).toBeDefined();
        expect(loggedInUser?.email).toBeDefined();
        expect(setItemMock).toHaveBeenCalled();

        setItemMock.mockRestore();
    });

    it('should get user info', async () => {
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

        const { result: getUserResult } = renderHook(() => Auth.useUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(getUserResult.current.data).toBeDefined());
        expect(getUserResult.current.data?.email).toBe(user.email);
    });

    it('should log a user out', async () => {
        const removeItemMock = vi.spyOn(Storage.prototype, 'removeItem');
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

        const { result: logoutResult } = renderHook(() => Auth.useLogout(), {
            wrapper: createWrapper(),
        });
        logoutResult.current.mutate({});
        await waitFor(() => expect(logoutResult.current.data).toBe(true));

        expect(removeItemMock).toHaveBeenCalled();
        removeItemMock.mockRestore();
    });
});

describe.shuffle('Auth (Error handling)', () => {
    it('[Auth.useRegisterLocal] should handle a 409 status code if email is already taken', async () => {
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

    it('[Auth.useLoginLocal] should handle a 403 status code if user does not exist', async () => {
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

    it('[Auth.useLoginLocal] should handle a 403 status code if password is invalid', async () => {
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

    it('[Auth.useUser] should handle a 401 status code on requests with no access token', async () => {
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

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const { result: getUserResult } = renderHook(() => Auth.useUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(getUserResult.current.error).toBeDefined();
            expect(getUserResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Auth.useUser] should handle a 401 status code if accessing with an expired access token', async () => {
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

        // Get current access_token
        const nonExpiredAccessToken =
            localStorage.getItem('access_token') ?? '';
        const userId = (await verifyToken(nonExpiredAccessToken)) ?? '';
        const expiredAccessToken = await generateJwtToken(
            {
                _id: userId,
                email: user.email,
            },
            '0s',
        );
        // Set access_token to an expired access_token
        localStorage.setItem('access_token', expiredAccessToken);

        const { result: getUserResult } = renderHook(() => Auth.useUser(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(getUserResult.current.error).toBeDefined();
            expect(getUserResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });
});

describe.shuffle('Token Refresh', () => {
    it('should refresh token if authorized', async () => {
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

        const setItemMock = vi.spyOn(Storage.prototype, 'setItem');
        const { result: tokenRefresh } = renderHook(
            () => Auth.useTokenRefresh(),
            {
                wrapper: createWrapper(),
            },
        );
        const refreshTokenIfNeeded = tokenRefresh.current;

        await waitFor(() => expect(refreshTokenIfNeeded()).resolves.toBe(true));
        expect(setItemMock).toHaveBeenCalled();

        setItemMock.mockRestore();
    });

    it('[Auth.useTokenRefresh] should handle a 401 status code if user does not exist', async () => {
        const removeItemMock = vi.spyOn(Storage.prototype, 'removeItem');
        const nonExistentUser = {
            _id: ObjectID(0).toHexString(),
            email: 'non@existent.com',
        };
        // Set refresh_token to non-existent user's refresh_token
        localStorage.setItem(
            'refresh_token',
            await generateJwtToken(nonExistentUser, 'refresh_token'),
        );

        const { result: tokenRefresh } = renderHook(
            () => Auth.useTokenRefresh(),
            {
                wrapper: createWrapper(),
            },
        );
        const refreshTokenIfNeeded = tokenRefresh.current;

        try {
            await refreshTokenIfNeeded();
        } catch (err) {
            const error = err as AxiosError['response'];
            expect(removeItemMock).toHaveBeenCalled();
            expect(error?.status).toBe(HttpStatusCode.Unauthorized);
            expect(error?.statusText).toBe('User does not exist');
        }

        removeItemMock.mockRestore();
    });

    it('[Auth.useTokenRefresh] should handle a 403 status code if a user is logged out', async () => {
        const removeItemMock = vi.spyOn(Storage.prototype, 'removeItem');
        // Create a user that will log out
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

        // Capture refresh_token that is supposed to be expired and must have been purged from localStorage
        const loggedOutRefreshToken =
            localStorage.getItem('refresh_token') ?? '';

        // Proceed with user log out
        const { result: logoutResult } = renderHook(() => Auth.useLogout(), {
            wrapper: createWrapper(),
        });
        logoutResult.current.mutate({});
        await waitFor(() => expect(logoutResult.current.data).toBe(true));

        // Set refresh_token to a supposedly purged refresh token
        localStorage.setItem('refresh_token', loggedOutRefreshToken);

        const { result: tokenRefresh } = renderHook(
            () => Auth.useTokenRefresh(),
            {
                wrapper: createWrapper(),
            },
        );
        const refreshTokenIfNeeded = tokenRefresh.current;

        try {
            await refreshTokenIfNeeded();
        } catch (err) {
            const error = err as AxiosError['response'];
            expect(removeItemMock).toHaveBeenCalled();
            expect(error?.status).toBe(HttpStatusCode.Forbidden);
            expect(error?.statusText).toBe('Cannot refresh when logged out');
        }

        removeItemMock.mockRestore();
    });
});

describe.shuffle('Project', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('should create a new project', async () => {
        const newProjectTitle = 'new project';
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });

        createResult.current.mutate({ title: newProjectTitle });

        await waitFor(() => expect(createResult.current.data).toBeDefined());
        expect(createResult.current.data?.title).toBe(newProjectTitle);
    });

    it('should find all projects owned by a user', async () => {
        const { result } = renderHook(() => Project.useFindAll(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.data).toBeDefined());
        const projects = result.current.data;

        expect(projects).toHaveLength(5);
    });

    it('should find all projects a user is a collaborator of', async () => {
        const collaboratingUser = {
            _id: ObjectID(0).toHexString(),
            email: 'collab@teapot.com',
        };

        // Create a project to collaborate on
        const newProject: ProjectDto = { title: 'collaborative project' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';
        const { result: ownerUpdateResult } = renderHook(
            () => Project.useUpdate(projectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Owner adds collaboratingUser to collaborators
        ownerUpdateResult.current.mutate({
            collaborators: [collaboratingUser._id],
        });
        await waitFor(() =>
            expect(ownerUpdateResult.current.data).toBeDefined(),
        );

        // Set access_token to collaborator's access_token
        localStorage.setItem(
            'access_token',
            await generateJwtToken(collaboratingUser, 'access_token'),
        );

        const { result: collaboratorFindAll } = renderHook(
            () => Project.useFindAll(),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() =>
            expect(collaboratorFindAll.current.data).toBeDefined(),
        );
        const collaboratedProjects = collaboratorFindAll.current.data;
        const collabProjectTitle = collaboratedProjects
            ? collaboratedProjects[0].title
            : '';

        expect(collaboratedProjects).toHaveLength(1);
        expect(collabProjectTitle).toBe('collaborative project');
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
        // Create a document to update
        const newProject: ProjectDto = { title: 'new project' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        const updatedDescription = 'project with description';
        const { result: updateResult } = renderHook(
            () => Project.useUpdate(projectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Update the document
        updateResult.current.mutate({ description: updatedDescription });

        await waitFor(() => expect(updateResult.current.data).toBeDefined());
        const updatedProject = updateResult.current.data;

        // Expect that PATCH returns the updated document
        expect(updatedProject?.description).toBe(updatedDescription);
    });

    it('should let collaborator update project of another user', async () => {
        const collaboratingUser = {
            _id: ObjectID(0).toHexString(),
            email: 'collab@teapot.com',
        };

        // Create a document to update
        const newProject: ProjectDto = { title: 'new project' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        const { result: ownerUpdateResult } = renderHook(
            () => Project.useUpdate(projectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Owner adds collaboratingUser to collaborators
        ownerUpdateResult.current.mutate({
            collaborators: [collaboratingUser._id],
        });
        await waitFor(() =>
            expect(ownerUpdateResult.current.data).toBeDefined(),
        );

        // Set access_token to collaborator's access_token
        localStorage.setItem(
            'access_token',
            await generateJwtToken(collaboratingUser, 'access_token'),
        );

        // Collaborator updates the document
        const collabUpdatedDescription = 'description updated by collaborator';
        const { result: collabUpdateResult } = renderHook(
            () => Project.useUpdate(projectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Collaborator updates the document
        collabUpdateResult.current.mutate({
            description: collabUpdatedDescription,
        });

        await waitFor(() =>
            expect(collabUpdateResult.current.data).toBeDefined(),
        );
        const updatedProject = collabUpdateResult.current.data;

        // Expect that PATCH returns the updated document
        expect(updatedProject?.description).toBe(collabUpdatedDescription);
    });

    it('should remove project of a user', async () => {
        // Create a document to remove
        const newProject: ProjectDto = { title: 'delete me' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        const { result: removeResult } = renderHook(
            () => Project.useRemove(projectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Remove the document
        removeResult.current.mutate();
        await waitFor(() => expect(removeResult.current.data).toBeDefined());

        expect(removeResult.current.data).toBe(true);
    });
});

describe.shuffle('Project (Error handling)', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('[Project.useCreate] should handle a 401 status code', async () => {
        clearTestAccessTokenFromLocalStorage();
        const newProjectTitle = 'new project';
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });

        createResult.current.mutate({ title: newProjectTitle });

        await waitFor(() => {
            expect(createResult.current.error).toBeDefined();
            expect(createResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Project.useFindAll] should handle a 401 status code', async () => {
        clearTestAccessTokenFromLocalStorage();
        const { result } = renderHook(() => Project.useFindAll(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Project.useFindOne] should handle a 401 status code', async () => {
        clearTestAccessTokenFromLocalStorage();
        const mockProjectId = mockProjects()[0]._id;
        const { result } = renderHook(() => Project.useFindOne(mockProjectId), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Project.useFindOne] should handle a 404 status code', async () => {
        const nonExistentProjectId = ObjectID(0).toHexString();
        const { result } = renderHook(
            () => Project.useFindOne(nonExistentProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(HttpStatusCode.NotFound);
            expect(result.current.error?.statusText).toBe('Project not found');
        });
    });

    it('[Project.useGetProjectMembers] should handle a 401 status code', async () => {
        clearTestAccessTokenFromLocalStorage();
        const mockProjectId = mockProjects()[0]._id;
        const { result } = renderHook(
            () => Project.useGetProjectMembers(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Project.useGetProjectMembers] should handle a 404 status code', async () => {
        const nonExistentProjectId = ObjectID(0).toHexString();
        const { result } = renderHook(
            () => Project.useGetProjectMembers(nonExistentProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(HttpStatusCode.NotFound);
        });
    });

    it('[Project.useUpdate] should handle a 401 status code', async () => {
        // Create a document to FAIL to update
        const newProject: ProjectDto = { title: 'new project' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const updatedDescription = 'project with description';
        const { result: updateResult } = renderHook(
            () => Project.useUpdate(projectId),
            {
                wrapper: createWrapper(),
            },
        );
        updateResult.current.mutate({ description: updatedDescription });

        await waitFor(() => {
            expect(updateResult.current.error).toBeDefined();
            expect(updateResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Project.useUpdate] should handler a 404 status code', async () => {
        const nonExistentProjectId = ObjectID(0).toHexString();
        const { result: updateResult } = renderHook(
            () => Project.useUpdate(nonExistentProjectId),
            {
                wrapper: createWrapper(),
            },
        );
        updateResult.current.mutate({ description: 'some description' });

        await waitFor(() => {
            expect(updateResult.current.error).toBeDefined();
            expect(updateResult.current.error?.status).toBe(
                HttpStatusCode.NotFound,
            );
        });
    });

    it('[Project.useUpdate] should handler a 403 status code', async () => {
        const forbiddenUser = {
            _id: ObjectID(0).toHexString(),
            email: 'not@teapot.com',
        };

        // Create a document to FAIL to update
        const newProject: ProjectDto = { title: 'update me' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Set access_token to someone else's access_token
        localStorage.setItem(
            'access_token',
            await generateJwtToken(forbiddenUser, 'access_token'),
        );

        const { result: updateResult } = renderHook(
            () => Project.useUpdate(projectId),
            {
                wrapper: createWrapper(),
            },
        );
        updateResult.current.mutate({ description: 'some description' });

        await waitFor(() => {
            expect(updateResult.current.error).toBeDefined();
            expect(updateResult.current.error?.status).toBe(
                HttpStatusCode.Forbidden,
            );
        });
    });

    it('[Project.useRemove] should handler a 401 status code', async () => {
        // Create a document to FAIL to remove
        const newProject: ProjectDto = { title: 'delete me' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const { result: removeResult } = renderHook(
            () => Project.useRemove(projectId),
            {
                wrapper: createWrapper(),
            },
        );
        removeResult.current.mutate();

        await waitFor(() => {
            expect(removeResult.current.error).toBeDefined();
            expect(removeResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Project.useRemove] should handler a 404 status code', async () => {
        const nonExistentProjectId = ObjectID(0).toHexString();
        const { result: removeResult } = renderHook(
            () => Project.useRemove(nonExistentProjectId),
            {
                wrapper: createWrapper(),
            },
        );
        removeResult.current.mutate();

        await waitFor(() => {
            expect(removeResult.current.error).toBeDefined();
            expect(removeResult.current.error?.status).toBe(
                HttpStatusCode.NotFound,
            );
        });
    });

    it('[Project.useRemove] should handler a 403 status code', async () => {
        const forbiddenUser = {
            _id: ObjectID(0).toHexString(),
            email: 'not@teapot.com',
        };

        // Create a document to FAIL to remove
        const newProject: ProjectDto = { title: 'delete me' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        const projectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Set access_token to someone else's access_token
        localStorage.setItem(
            'access_token',
            await generateJwtToken(forbiddenUser, 'access_token'),
        );

        const { result: removeResult } = renderHook(
            () => Project.useRemove(projectId),
            {
                wrapper: createWrapper(),
            },
        );

        removeResult.current.mutate();

        await waitFor(() => {
            expect(removeResult.current.error).toBeDefined();
            expect(removeResult.current.error?.status).toBe(
                HttpStatusCode.Forbidden,
            );
            expect(removeResult.current.error?.statusText).toBe(
                'Invalid credentials: Cannot delete resource',
            );
        });
    });
});

describe.shuffle('Task', () => {
    let mockProjectId: string;
    let mockTaskState: string;
    let collaboratingUser: ProjectMember;

    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();

        collaboratingUser = {
            _id: ObjectID(0).toHexString(),
            email: 'collab@teapot.com',
        };

        // Create a project to add task to
        const newProject: ProjectDto = { title: 'new project' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        mockProjectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';
        mockTaskState = createResult.current.isSuccess
            ? createResult.current.data.taskStates[0]
            : '';

        const { result: updateResult } = renderHook(
            () => Project.useUpdate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Owner adds collaboratingUser to collaborators
        updateResult.current.mutate({
            collaborators: [collaboratingUser._id],
        });
        await waitFor(() => expect(updateResult.current.data).toBeDefined());
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('should create new task', async () => {
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
        expect(createResult.current.data?.title).toBe(newTaskTitle);
    });

    it('should findAll tasks of a user', async () => {
        // Add tasks to project
        const { result: createResult } = renderHook(
            () => Task.useCreate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );
        for (let i = 0; i < 3; i++) {
            createResult.current.mutate({
                title: mockProjects()[0].tasks[0].title,
                taskState: mockProjects()[0].taskStates[0],
            });
            await waitFor(() =>
                expect(createResult.current.data).toBeDefined(),
            );
        }

        const { result: findAllResult } = renderHook(
            () => Task.useFindAll(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => expect(findAllResult.current.data).toBeDefined());
        const tasks = findAllResult.current.data;

        expect(tasks).toHaveLength(3);
    });

    it('should findOne task of a project', async () => {
        // Create a task to find
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
        const mockTaskId = createResult.current.isSuccess
            ? createResult.current.data?._id
            : '';

        const { result: findOneResult } = renderHook(
            () => Task.useFindOne(mockProjectId, mockTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => expect(findOneResult.current.data).toBeDefined());
        const task = findOneResult.current.data;

        expect(task?._id).toBe(mockTaskId);
    });

    it('should update task', async () => {
        // Create a task to update
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

        const mockTaskId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';
        const updatedTaskTitle = 'updated task title';
        const { result: updateResult } = renderHook(
            () => Task.useUpdate(mockProjectId, mockTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Update the task
        updateResult.current.mutate({
            title: updatedTaskTitle,
        });

        await waitFor(() => expect(updateResult.current.data).toBeDefined());

        // Expect that PATCH returns the updated task
        expect(updateResult.current.data?.title).toBe(updatedTaskTitle);
    });

    it('should remove task as an owner', async () => {
        // Create a task to remove
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
        const taskId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        const { result: removeResult } = renderHook(
            () => Task.useRemove(mockProjectId, taskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Remove the task
        removeResult.current.mutate();
        await waitFor(() => expect(removeResult.current.data).toBeDefined());

        expect(removeResult.current.data).toBe(true);
    });

    it('should remove task as a collaborator project member', async () => {
        // Create a task to remove
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
        const taskId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Set access_token to collaborator's access_token
        localStorage.setItem(
            'access_token',
            await generateJwtToken(collaboratingUser, 'access_token'),
        );

        const { result: removeResult } = renderHook(
            () => Task.useRemove(mockProjectId, taskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Remove the task
        removeResult.current.mutate();
        await waitFor(() => expect(removeResult.current.data).toBeDefined());

        expect(removeResult.current.data).toBe(true);
    });
});

describe.shuffle('Task (Error handling)', () => {
    let mockProjectId: string;
    let mockTaskState: string;

    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();

        const collaboratingUser = {
            _id: ObjectID(0).toHexString(),
            email: 'collab@teapot.com',
        };

        // Create a project to add task to
        const newProject: ProjectDto = { title: 'new project' };
        const { result: createResult } = renderHook(() => Project.useCreate(), {
            wrapper: createWrapper(),
        });
        createResult.current.mutate(newProject);
        await waitFor(() => expect(createResult.current.data).toBeDefined());
        mockProjectId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';
        mockTaskState = createResult.current.isSuccess
            ? createResult.current.data.taskStates[0]
            : '';

        const { result: updateResult } = renderHook(
            () => Project.useUpdate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        // Owner adds collaboratingUser to collaborators
        updateResult.current.mutate({
            collaborators: [collaboratingUser._id],
        });
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('[Task.useCreate] should handle a 401 status code', async () => {
        clearTestAccessTokenFromLocalStorage();
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

        await waitFor(() => {
            expect(createResult.current.error).toBeDefined();
            expect(createResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Task.useFindAll] should handle a 401 status code', async () => {
        // Add tasks to project
        const { result: createResult } = renderHook(
            () => Task.useCreate(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );
        for (let i = 0; i < 3; i++) {
            createResult.current.mutate({
                title: mockProjects()[0].tasks[0].title,
                taskState: mockProjects()[0].taskStates[0],
            });
            await waitFor(() =>
                expect(createResult.current.data).toBeDefined(),
            );
        }

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const { result: findAllResult } = renderHook(
            () => Task.useFindAll(mockProjectId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(findAllResult.current.error).toBeDefined();
            expect(findAllResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Task.useFindOne] should handle a 401 status code', async () => {
        // Create a task to find
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
        const mockTaskId = createResult.current.isSuccess
            ? createResult.current.data?._id
            : '';

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const { result: findOneResult } = renderHook(
            () => Task.useFindOne(mockProjectId, mockTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(findOneResult.current.error).toBeDefined();
            expect(findOneResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Task.useFindOne] should handle a 404 status code', async () => {
        const nonExistentTaskId = ObjectID(0).toHexString();
        const { result } = renderHook(
            () => Task.useFindOne(mockProjectId, nonExistentTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        await waitFor(() => {
            expect(result.current.error).toBeDefined();
            expect(result.current.error?.status).toBe(HttpStatusCode.NotFound);
            expect(result.current.error?.statusText).toBe('Task not found');
        });
    });

    it('[Task.useUpdate] should handle a 401 status code', async () => {
        // Create a document to FAIL to update
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

        const mockTaskId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const updatedTaskTitle = 'updated task title';
        const { result: updateResult } = renderHook(
            () => Task.useUpdate(mockProjectId, mockTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Update the task
        updateResult.current.mutate({
            title: updatedTaskTitle,
        });

        await waitFor(() => {
            expect(updateResult.current.error).toBeDefined();
            expect(updateResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Task.useUpdate] should handle a 404 status code', async () => {
        const nonExistentTaskId = ObjectID(0).toHexString();
        const updatedTaskTitle = 'update task title attempt';
        const { result: updateResult } = renderHook(
            () => Task.useUpdate(mockProjectId, nonExistentTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Update the document
        updateResult.current.mutate({
            title: updatedTaskTitle,
        });

        await waitFor(() => {
            expect(updateResult.current.error).toBeDefined();
            expect(updateResult.current.error?.status).toBe(
                HttpStatusCode.NotFound,
            );
            expect(updateResult.current.error?.statusText).toBe(
                'Task not found',
            );
        });
    });

    it('[Task.useRemove] should handle a 401 status code', async () => {
        // Create a task to FAIL to remove
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
        const taskId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Clear the access token
        clearTestAccessTokenFromLocalStorage();

        const { result: removeResult } = renderHook(
            () => Task.useRemove(mockProjectId, taskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Remove the task
        removeResult.current.mutate();

        await waitFor(() => {
            expect(removeResult.current.error).toBeDefined();
            expect(removeResult.current.error?.status).toBe(
                HttpStatusCode.Unauthorized,
            );
        });
    });

    it('[Task.useRemove] should handle a 404 status code', async () => {
        const nonExistentTaskId = ObjectID(0).toHexString();
        const { result: removeResult } = renderHook(
            () => Task.useRemove(mockProjectId, nonExistentTaskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Update the document
        removeResult.current.mutate();

        await waitFor(() => {
            expect(removeResult.current.error).toBeDefined();
            expect(removeResult.current.error?.status).toBe(
                HttpStatusCode.NotFound,
            );
            expect(removeResult.current.error?.statusText).toBe(
                'Task not found',
            );
        });
    });

    it('[Task.useRemove] should handle a 403 status code', async () => {
        const forbiddenUser = {
            _id: ObjectID(0).toHexString(),
            email: 'not@teapot.com',
        };

        // Create a task to FAIL to remove
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
        const taskId = createResult.current.isSuccess
            ? createResult.current.data._id
            : '';

        // Set access_token to someone else's access_token
        localStorage.setItem(
            'access_token',
            await generateJwtToken(forbiddenUser, 'access_token'),
        );

        const { result: removeResult } = renderHook(
            () => Task.useRemove(mockProjectId, taskId),
            {
                wrapper: createWrapper(),
            },
        );

        // Remove the document
        removeResult.current.mutate();

        await waitFor(() => {
            expect(removeResult.current.error).toBeDefined();
            expect(removeResult.current.error?.status).toBe(
                HttpStatusCode.Forbidden,
            );
            expect(removeResult.current.error?.statusText).toBe(
                'Invalid credentials: Cannot update resource',
            );
        });
    });
});
