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

const getUsers = () => {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
        return;
    }

    return JSON.parse(storedUsers) as MockedUser[];
};

const getUserById = (userId: string) => {
    const mockUser = getUsers()?.find((user) => user._id === userId);
    if (mockUser) {
        const user: User = { _id: mockUser._id, email: mockUser.email };
        return user;
    }
};

const getProjects = () => {
    const storedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!storedProjects) {
        return;
    }
    return JSON.parse(storedProjects) as ProjectDocument[];
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
        const { email, password }: AuthDto = await req.json();

        const users = getUsers();
        if (!users) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock users not loaded to localStorage',
                ),
            );
        }

        const _id = ObjectID().toHexString();
        const generatedTokens: AuthToken = {
            access_token: await generateJwtToken(
                { _id, email },
                'access_token',
            ),
            refresh_token: await generateJwtToken(
                { _id, email },
                'refresh_token',
            ),
        };
        const newUser: MockedUser = {
            _id,
            email,
            hashed_password: password,
            refresh_token: generatedTokens.refresh_token,
        };

        const isExistingEmail = users.some(
            (user) => user.email === newUser.email,
        );
        if (isExistingEmail) {
            return res(
                ctx.status(HttpStatusCode.Conflict, 'Email is already taken'),
            );
        }

        const updatedUsers = [...users, newUser];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

        return res(
            ctx.json(generatedTokens),
            ctx.status(HttpStatusCode.Created),
        );
    }),

    rest.post('/api/auth/local/login', async (req, res, ctx) => {
        const { email, password }: AuthDto = await req.json();

        const users = getUsers();
        if (!users) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock users not loaded to localStorage',
                ),
            );
        }

        const userIndex = users.findIndex((x) => x.email === email);
        if (userIndex < 0) {
            return res(
                ctx.status(
                    HttpStatusCode.Forbidden,
                    'Invalid credentials: user does not exist',
                ),
            );
        }
        const user = users[userIndex];

        const isValidPassword = user.hashed_password === password;
        if (!isValidPassword) {
            return res(
                ctx.status(HttpStatusCode.Forbidden, 'Invalid password'),
            );
        }

        const generatedTokens: AuthToken = {
            access_token: await generateJwtToken(
                { _id: user._id, email: user.email },
                'access_token',
            ),
            refresh_token: await generateJwtToken(
                { _id: user._id, email: user.email },
                'refresh_token',
            ),
        };

        const updatedUser: MockedUser = {
            ...user,
            refresh_token: generatedTokens.refresh_token,
        };

        const updatedUsers = users.map((user, index) => {
            if (index === userIndex) {
                return updatedUser;
            }
            return user;
        });
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

        return res(ctx.json(generatedTokens), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/users/me', (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const user = getUserById(userId);

        return res(ctx.json(user), ctx.status(HttpStatusCode.Ok));
    }),

    rest.post('/api/auth/logout', async (req, res, ctx) => {
        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        getUsers()?.map((user) => {
            if (user._id === userId) {
                user.refresh_token = null;
            }
            return user;
        });

        return res(ctx.status(HttpStatusCode.Ok));
    }),

    rest.post('/api/projects', async (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const interceptedPayload: ProjectDto = await req.json();

        const newProject: ProjectDocument = {
            _id: ObjectID().toHexString(),
            collaborators: [],
            taskStates: ['todo', 'doing', 'done'],
            tasks: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ownerId: userId,
            ...interceptedPayload,
        };
        const updatedProjects = [...projects, newProject];

        localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(updatedProjects),
        );

        return res(ctx.json(newProject), ctx.status(HttpStatusCode.Created));
    }),

    rest.get('/api/projects', (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }

        const foundProjects = projects.filter(
            (project) =>
                project.ownerId === userId ||
                project.collaborators.includes(userId),
        );
        return res(ctx.json(foundProjects), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId', (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const { projectId } = req.params;

        const project = projects.find((project) => project._id === projectId);

        if (!project) {
            return res(
                ctx.status(HttpStatusCode.NotFound, 'Project not found'),
            );
        }

        return res(ctx.json(project), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/members', (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const { projectId } = req.params;

        const project = projects.find((project) => project._id === projectId);

        if (!project) {
            return res(ctx.status(HttpStatusCode.NotFound));
        }

        const projectMemberIds = project
            ? [project.ownerId, ...project.collaborators]
            : [];

        const projectMembers = projectMemberIds.map((userId) => {
            const user = getUserById(userId);
            if (!user) {
                throw res(ctx.status(HttpStatusCode.NotFound));
            }
            const member: ProjectMember = { _id: user._id, email: user.email };
            return member;
        });

        return res(ctx.json(projectMembers), ctx.status(HttpStatusCode.Ok));
    }),

    rest.patch('/api/projects/:projectId', async (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const interceptedPayload: UpdateProjectDto = await req.json();
        const { projectId } = req.params;

        const project = projects.find((project) => project._id === projectId);

        if (!project) {
            return res(ctx.status(HttpStatusCode.NotFound));
        }

        if (![project.ownerId, ...project.collaborators].includes(userId)) {
            return res(
                ctx.status(
                    HttpStatusCode.Forbidden,
                    'Invalid credentials: Cannot update resource',
                ),
            );
        }

        const updatedProject = {
            ...project,
            ...interceptedPayload,
        };
        const updatedProjects = getProjects()?.map((project) => {
            if (project._id === projectId) {
                return updatedProject;
            }
            return project;
        });

        localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(updatedProjects),
        );

        return res(ctx.json(updatedProject), ctx.status(HttpStatusCode.Ok));
    }),

    rest.delete('/api/projects/:projectId', (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const { projectId } = req.params;

        const projectIndex = projects.findIndex(
            (project) => project._id === projectId,
        );

        if (projectIndex < 0) {
            return res(ctx.status(HttpStatusCode.NotFound));
        }

        if (projects[projectIndex].ownerId !== userId) {
            return res(
                ctx.status(
                    HttpStatusCode.Forbidden,
                    'Invalid credentials: Cannot delete resource',
                ),
            );
        }

        const updatedProjects = [
            ...projects.slice(0, projectIndex),
            projects.slice(projectIndex + 1),
        ];

        localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(updatedProjects),
        );

        return res(ctx.status(HttpStatusCode.NoContent));
    }),

    rest.post('/api/projects/:projectId/tasks', async (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const interceptedPayload: TaskDto = await req.json();
        const { projectId } = req.params;

        const project = projects.find((project) => project._id === projectId);
        if (!project) {
            return res(ctx.status(HttpStatusCode.NotFound));
        }

        const newTask: TaskDocument = {
            _id: ObjectID().toHexString(),
            description: '',
            assignedProjMemberId: [],
            ...interceptedPayload,
        };
        const updatedTasks = [...project.tasks, newTask];
        const updatedProject = { ...project, tasks: updatedTasks };
        const updatedProjects = projects.map((project) => {
            if (project._id === projectId) {
                return updatedProject;
            }
            return project;
        });

        localStorage.setItem(
            PROJECTS_STORAGE_KEY,
            JSON.stringify(updatedProjects),
        );

        return res(ctx.json(newTask), ctx.status(HttpStatusCode.Created));
    }),

    rest.get('/api/projects/:projectId/tasks', (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const { projectId } = req.params;

        const project = projects.find((project) => project._id === projectId);
        if (!project) {
            return res(ctx.status(HttpStatusCode.NotFound));
        }

        return res(ctx.json(project.tasks), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/tasks/:taskId', (req, res, ctx) => {
        const projects = getProjects();
        if (!projects) {
            return res(
                ctx.status(
                    HttpStatusCode.InternalServerError,
                    'Mock projects not loaded to localStorage',
                ),
            );
        }

        const authHeader = req.headers.get('Authorization');
        const userId = authGuard(authHeader);

        if (!userId) {
            return res(ctx.status(HttpStatusCode.Unauthorized));
        }
        const { projectId, taskId } = req.params;

        const project = projects.find((project) => project._id === projectId);
        if (!project) {
            return res(ctx.status(HttpStatusCode.NotFound));
        }

        const tasks = project.tasks;
        const task = tasks.find((task) => task._id === taskId);
        if (!task) {
            return res(ctx.status(HttpStatusCode.NotFound, 'Task not found'));
        }

        return res(ctx.json(task), ctx.status(HttpStatusCode.Ok));
    }),

    rest.patch(
        '/api/projects/:projectId/tasks/:taskId',
        async (req, res, ctx) => {
            const projects = getProjects();
            if (!projects) {
                return res(
                    ctx.status(
                        HttpStatusCode.InternalServerError,
                        'Mock projects not loaded to localStorage',
                    ),
                );
            }

            const authHeader = req.headers.get('Authorization');
            const userId = authGuard(authHeader);

            if (!userId) {
                return res(ctx.status(HttpStatusCode.Unauthorized));
            }

            const interceptedPayload: UpdateTaskDto = await req.json();
            const { projectId, taskId } = req.params;

            const project = projects.find(
                (project) => project._id === projectId,
            );
            if (!project) {
                return res(ctx.status(HttpStatusCode.NotFound));
            }

            const tasks = project.tasks;
            const taskToUpdate = tasks.find((task) => task._id === taskId);
            if (!taskToUpdate) {
                return res(
                    ctx.status(HttpStatusCode.NotFound, 'Task not found'),
                );
            }

            const updatedTask = {
                ...taskToUpdate,
                ...interceptedPayload,
            };
            const updatedTasks = project.tasks.map((task) => {
                if (task._id === taskId) {
                    return updatedTask;
                }
                return task;
            });
            const updatedProject = { ...project, tasks: updatedTasks };
            const updatedProjects = projects.map((project) => {
                if (project._id === projectId) {
                    return updatedProject;
                }
                return project;
            });

            localStorage.setItem(
                PROJECTS_STORAGE_KEY,
                JSON.stringify(updatedProjects),
            );

            return res(ctx.json(updatedTask), ctx.status(HttpStatusCode.Ok));
        },
    ),
];
