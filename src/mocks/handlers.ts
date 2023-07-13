import { HttpStatusCode } from 'axios';
import ObjectID from 'bson-objectid';
import { rest } from 'msw';

import {
    AuthDto,
    AuthToken,
    MockedUser,
    ProjectDocument,
    ProjectDto,
    ProjectMember,
    TaskDocument,
    TaskDto,
    UpdateProjectDto,
    UpdateTaskDto,
    User,
} from '../common';
import { decodeAccessToken, generateJwtToken } from '../lib/utils';

import { PROJECTS_STORAGE_KEY, USERS_STORAGE_KEY } from './constants';

interface AddProjectToStorage {
    ownerId: string;
    payload: ProjectDto;
}

interface PostProjectToStorage {
    id: string;
    payload: UpdateProjectDto;
}

const getUsers = (userId: string) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedData) {
        return;
    }
    const userList: MockedUser[] = JSON.parse(storedData);
    const mockUser = userList.find((user) => user._id === userId);
    if (mockUser) {
        const user: User = { _id: mockUser._id, email: mockUser.email };
        return user;
    }
};

const logUserOut = (userId: string) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedData) {
        return;
    }
    const userList: MockedUser[] = JSON.parse(storedData);
    userList.map((user) => {
        if (user._id === userId) {
            user.refresh_token = null;
        }
        return user;
    });
};

const logUserIn = async ({ email, password }: AuthDto) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);

    if (storedData) {
        const parsedData: MockedUser[] = JSON.parse(storedData);

        const existingUserIndex = parsedData.findIndex(
            (x) => x.email === email,
        );
        if (existingUserIndex < 0) {
            return new Error('Invalid credentials: user does not exist');
        }
        const existingUser = parsedData[existingUserIndex];

        const isValidPassword = existingUser.hashed_password === password;
        if (!isValidPassword) {
            return new Error('Invalid password');
        }

        const generatedTokens: AuthToken = {
            access_token: await generateJwtToken(
                { _id: existingUser._id, email: existingUser.email },
                'access_token',
            ),
            refresh_token: await generateJwtToken(
                { _id: existingUser._id, email: existingUser.email },
                'refresh_token',
            ),
        };

        const updatedUser: MockedUser = {
            ...existingUser,
            refresh_token: generatedTokens.refresh_token,
        };

        const updatedData = parsedData.map((user, index) => {
            if (index === existingUserIndex) {
                return updatedUser;
            }
            return user;
        });
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedData));
        return generatedTokens;
    }

    return new Error('Invalid credentials: user does not exist');
};

const addUserToStorage = async ({ email, password }: AuthDto) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);

    const _id = ObjectID().toHexString();
    const generatedTokens: AuthToken = {
        access_token: await generateJwtToken({ _id, email }, 'access_token'),
        refresh_token: await generateJwtToken({ _id, email }, 'refresh_token'),
    };
    const newUser: MockedUser = {
        _id,
        email,
        hashed_password: password,
        refresh_token: generatedTokens.refresh_token,
    };

    if (storedData) {
        const parsedData: MockedUser[] = JSON.parse(storedData);

        const isExistingEmail = parsedData
            .map((x) => x.email)
            .includes(newUser.email);
        if (isExistingEmail) {
            return new Error('Email is already taken');
        }

        const updatedData = [...parsedData, newUser];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedData));
        return generatedTokens;
    }

    const newUsersData = [newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsersData));
    return generatedTokens;
};

const getProjects = () => {
    const storedData = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!storedData) {
        return;
    }
    return JSON.parse(storedData) as ProjectDocument[];
};

const postProjectToStorage = ({ id, payload }: PostProjectToStorage) => {
    const storedData = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (storedData) {
        const parsedData: ProjectDocument[] = JSON.parse(storedData);
        const existingProject = parsedData.find(
            (project) => project._id === id,
        );

        if (existingProject) {
            const updatedProject = {
                ...existingProject,
                ...payload,
            };
            const updatedData = parsedData.map((project) => {
                if (project._id === id) {
                    return updatedProject;
                }
                return project;
            });
            localStorage.setItem(
                PROJECTS_STORAGE_KEY,
                JSON.stringify(updatedData),
            );
            return updatedProject;
        }
    }
};

const addProjectToStorage = ({ ownerId, payload }: AddProjectToStorage) => {
    const storedData = localStorage.getItem(PROJECTS_STORAGE_KEY);
    const newProject: ProjectDocument = {
        _id: ObjectID().toHexString(),
        collaborators: [],
        taskStates: ['todo', 'doing', 'done'],
        tasks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId,
        ...payload,
    };

    if (storedData) {
        const parsedData: ProjectDocument[] = JSON.parse(storedData);

        const updatedData = [...parsedData, newProject];
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedData));
        return newProject;
    }

    const newProjectsData = [newProject];
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(newProjectsData));
    return newProject;
};

const postTaskToStorage = ({
    projectId,
    taskId,
    payload,
}: {
    projectId: string;
    taskId: string;
    payload: UpdateTaskDto;
}) => {
    const project = getProjects()?.find((project) => project._id === projectId);
    const taskToUpdate = project?.tasks.find((task) => task._id === taskId);
    if (project && taskToUpdate) {
        const updatedTask = {
            ...taskToUpdate,
            ...payload,
        };
        const updatedTasks = project.tasks.map((task) => {
            if (task._id === taskId) {
                return updatedTask;
            }
            return task;
        });
        const updatedProject = { ...project, tasks: updatedTasks };
        const updatedData = getProjects()?.map((project) => {
            if (project._id === projectId) {
                return updatedProject;
            }
            return project;
        });
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedData));
        return updatedTask;
    }
};

const addTaskToStorage = ({
    projectId,
    payload,
}: {
    projectId: string;
    payload: TaskDto;
}) => {
    const project = getProjects()?.find((project) => project._id === projectId);
    if (project) {
        const newTask: TaskDocument = {
            _id: ObjectID().toHexString(),
            description: '',
            assignedProjMemberId: [],
            ...payload,
        };
        const updatedTasks = [...project.tasks, newTask];
        const updatedProject = { ...project, tasks: updatedTasks };
        const updatedData = getProjects()?.map((project) => {
            if (project._id === projectId) {
                return updatedProject;
            }
            return project;
        });
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedData));
        return newTask;
    }
};

const authGuard = (header: string | null) => {
    const token = header?.split(' ')[1];
    if (!token) {
        return;
    }
    const id = decodeAccessToken(token).sub ?? 'none';
    return id;
};

export const handlers = [
    rest.post('/api/auth/local/register', async (req, res, ctx) => {
        const interceptedPayload: AuthDto = await req.json();
        const tokens = await addUserToStorage({
            email: interceptedPayload.email,
            password: interceptedPayload.password,
        });

        if (tokens instanceof Error) {
            return res(ctx.status(HttpStatusCode.Conflict, tokens.message));
        }

        return res(ctx.json(tokens), ctx.status(HttpStatusCode.Created));
    }),

    rest.post('/api/auth/local/login', async (req, res, ctx) => {
        const interceptedPayload: AuthDto = await req.json();
        const tokens = await logUserIn({
            email: interceptedPayload.email,
            password: interceptedPayload.password,
        });

        if (tokens instanceof Error) {
            return res(ctx.status(HttpStatusCode.Forbidden, tokens.message));
        }

        return res(ctx.json(tokens), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/users/me', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const user = getUsers(userId);

        return res(ctx.json(user), ctx.status(HttpStatusCode.Ok));
    }),

    rest.post('/api/auth/logout', async (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        logUserOut(userId);

        return res(ctx.status(HttpStatusCode.Ok));
    }),

    rest.post('/api/projects', async (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const interceptedPayload: ProjectDto = await req.json();
        const project = addProjectToStorage({
            ownerId: userId,
            payload: interceptedPayload,
        });
        return res(ctx.json(project), ctx.status(HttpStatusCode.Created));
    }),

    rest.get('/api/projects', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const projects = getProjects()?.filter(
            (project) => project.ownerId === userId,
        );
        return res(ctx.json(projects), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const { projectId } = req.params;
        const project = getProjects()?.find(
            (project) => project._id === projectId,
        );
        return res(ctx.json(project), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/members', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const { projectId } = req.params;
        const project = getProjects()?.find(
            (project) => project._id === projectId,
        );
        const projectMemberIds = project
            ? [project.ownerId, ...project.collaborators]
            : [];

        const projectMembers = projectMemberIds.map((id) => {
            const user = getUsers(id);
            if (!user) {
                throw res(ctx.status(HttpStatusCode.NotFound));
            }
            const member: ProjectMember = { _id: user._id, email: user.email };
            return member;
        });

        return res(ctx.json(projectMembers), ctx.status(HttpStatusCode.Ok));
    }),

    rest.patch('/api/projects/:projectId', async (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const interceptedPayload: UpdateProjectDto = await req.json();
        const { projectId } = req.params;
        const project = postProjectToStorage({
            id: projectId as string,
            payload: interceptedPayload,
        });
        return res(ctx.json(project), ctx.status(HttpStatusCode.Ok));
    }),

    rest.post('/api/projects/:projectId/tasks', async (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const interceptedPayload: TaskDto = await req.json();
        const { projectId } = req.params;
        const task = addTaskToStorage({
            projectId: projectId as string,
            payload: interceptedPayload,
        });

        return res(ctx.json(task), ctx.status(HttpStatusCode.Created));
    }),

    rest.get('/api/projects/:projectId/tasks', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const { projectId } = req.params;
        const tasks = getProjects()?.find(
            (project) => project._id === projectId,
        )?.tasks;

        return res(ctx.json(tasks ?? []), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/tasks/:taskId', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const { projectId, taskId } = req.params;
        const tasks = getProjects()?.find(
            (project) => project._id === projectId,
        )?.tasks;

        const task = tasks?.find((task) => task._id === taskId);

        if (task) {
            return res(ctx.json(task), ctx.status(HttpStatusCode.Ok));
        }
        return res(ctx.status(HttpStatusCode.NotFound));
    }),

    rest.patch(
        '/api/projects/:projectId/tasks/:taskId',
        async (req, res, ctx) => {
            const authHeader = req.headers.get('Authorization');
            const userId = authGuard(authHeader);

            if (!userId) {
                return res(ctx.status(HttpStatusCode.Unauthorized));
            }

            const interceptedPayload: UpdateTaskDto = await req.json();
            const { projectId, taskId } = req.params;
            const task = postTaskToStorage({
                projectId: projectId as string,
                taskId: taskId as string,
                payload: interceptedPayload,
            });

            return res(ctx.json(task), ctx.status(HttpStatusCode.Ok));
        },
    ),
];
