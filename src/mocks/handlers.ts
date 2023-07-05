import { HttpStatusCode } from 'axios';
import ObjectID from 'bson-objectid';
import { SignJWT } from 'jose';
import { rest } from 'msw';

import {
    AuthDto,
    AuthToken,
    ProjectDocument,
    ProjectDto,
    ProjectMember,
    TaskDocument,
    TaskDto,
    UpdateProjectDto,
    UpdateTaskDto,
    User,
} from '../common';

import { mockProjects, mockUsers } from './fixtures';

interface AddProjectToStorage {
    ownerId: string;
    payload: ProjectDto;
    localStorageKey?: string;
}

interface PostProjectToStorage {
    id: string;
    payload: UpdateProjectDto;
}

const PROJECTS_STORAGE_KEY = 'projects';
const USERS_STORAGE_KEY = 'users';
const JWT_SECRET = new TextEncoder().encode('super-secret');

const getUserFromStorage = (userId: string) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedData) {
        const userList: User[] = JSON.parse(storedData);
        return userList.find((user) => user._id === userId);
    } else {
        const initialData = mockUsers();
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialData));
        return initialData.find((user) => user._id === userId);
    }
};

const generateJwtToken = async (
    payload: Pick<User, '_id' | 'email'>,
    type: 'access_token' | 'refresh_token',
) => {
    const jwtPayload = { sub: payload._id, email: payload.email };
    const signedJwt = await new SignJWT({ ...jwtPayload })
        .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
        .setIssuedAt()
        .setExpirationTime(type === 'access_token' ? '15m' : '7d')
        .sign(JWT_SECRET);
    return signedJwt;
};

const addUserToStorage = async ({ email, password }: AuthDto) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);

    const _id = ObjectID().toHexString();
    const generatedTokens: AuthToken = {
        access_token: await generateJwtToken({ _id, email }, 'access_token'),
        refresh_token: await generateJwtToken({ _id, email }, 'refresh_token'),
    };
    const newUser: User = {
        _id,
        email,
        hashed_password: password,
        refresh_token: generatedTokens.refresh_token,
    };

    if (storedData) {
        const parsedData: User[] = JSON.parse(storedData);

        const updatedData = [...parsedData, newUser];
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedData));
        return generatedTokens;
    }

    const newUsersData = [newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsersData));
    return generatedTokens;
};

const getProjectsFromStorage = (): ProjectDocument[] => {
    const storedData = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (storedData) {
        return JSON.parse(storedData);
    } else {
        const initialData = mockProjects();
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
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

const addProjectToStorage = ({
    ownerId,
    payload,
    localStorageKey = PROJECTS_STORAGE_KEY,
}: AddProjectToStorage) => {
    const storedData = localStorage.getItem(localStorageKey);
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
        localStorage.setItem(localStorageKey, JSON.stringify(updatedData));
        return newProject;
    }

    const newProjectsData = [newProject];
    localStorage.setItem(localStorageKey, JSON.stringify(newProjectsData));
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
    const projects = getProjectsFromStorage();
    const project = projects.find((project) => project._id === projectId);
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
        const updatedData = projects.map((project) => {
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
    const projects = getProjectsFromStorage();
    const project = projects.find((project) => project._id === projectId);
    if (project) {
        const newTask: TaskDocument = {
            _id: ObjectID().toHexString(),
            description: '',
            assignedProjMemberId: [],
            ...payload,
        };
        const updatedTasks = [...project.tasks, newTask];
        const updatedProject = { ...project, tasks: updatedTasks };
        const updatedData = projects.map((project) => {
            if (project._id === projectId) {
                return updatedProject;
            }
            return project;
        });
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedData));
        return newTask;
    }
};

export const handleCreateProjectTest = () => {
    // PERF: create project gets its own localStorage
    // key to prevent collision with other tests
    return [
        rest.post('/api/projects', async (req, res, ctx) => {
            const interceptedPayload: ProjectDto = await req.json();
            const project = addProjectToStorage({
                localStorageKey: 'testKey',
                ownerId: ObjectID().toHexString(),
                payload: interceptedPayload,
            });
            return res(ctx.json(project), ctx.status(HttpStatusCode.Created));
        }),
    ];
};

export const handlers = [
    rest.post('/api/auth/local/register', async (req, res, ctx) => {
        const interceptedPayload: AuthDto = await req.json();
        const tokens = await addUserToStorage({
            email: interceptedPayload.email,
            password: interceptedPayload.password,
        });
        return res(ctx.json(tokens), ctx.status(HttpStatusCode.Created));
    }),
    rest.post('/api/projects', async (req, res, ctx) => {
        const interceptedPayload: ProjectDto = await req.json();
        const project = addProjectToStorage({
            // HACK: ownerId is derived from access_token.
            // This is a placeholder until Authorization is implemented
            ownerId: ObjectID().toHexString(),
            payload: interceptedPayload,
        });
        return res(ctx.json(project), ctx.status(HttpStatusCode.Created));
    }),

    rest.get('/api/projects', (_req, res, ctx) => {
        const projects = getProjectsFromStorage();
        return res(ctx.json(projects), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId', (req, res, ctx) => {
        const { projectId } = req.params;
        const project = getProjectsFromStorage().find(
            (project) => project._id === projectId,
        );
        return res(ctx.json(project), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/members', (req, res, ctx) => {
        const { projectId } = req.params;
        const project = getProjectsFromStorage().find(
            (project) => project._id === projectId,
        );
        const projectMemberIds = project
            ? [project.ownerId, ...project.collaborators]
            : [];

        const projectMembers = projectMemberIds.map((id) => {
            const user = getUserFromStorage(id);
            if (!user) {
                throw res(ctx.status(HttpStatusCode.NotFound));
            }
            const member: ProjectMember = { _id: user._id, email: user.email };
            return member;
        });

        return res(ctx.json(projectMembers), ctx.status(HttpStatusCode.Ok));
    }),

    rest.patch('/api/projects/:projectId', async (req, res, ctx) => {
        const interceptedPayload: UpdateProjectDto = await req.json();
        const { projectId } = req.params;
        const project = postProjectToStorage({
            id: projectId as string,
            payload: interceptedPayload,
        });
        return res(ctx.json(project), ctx.status(HttpStatusCode.Ok));
    }),

    rest.post('/api/projects/:projectId/tasks', async (req, res, ctx) => {
        const interceptedPayload: TaskDto = await req.json();
        const { projectId } = req.params;
        const task = addTaskToStorage({
            projectId: projectId as string,
            payload: interceptedPayload,
        });

        return res(ctx.json(task), ctx.status(HttpStatusCode.Created));
    }),

    rest.get('/api/projects/:projectId/tasks', (req, res, ctx) => {
        const { projectId } = req.params;
        const tasks = getProjectsFromStorage().find(
            (project) => project._id === projectId,
        )?.tasks;

        return res(ctx.json(tasks ?? []), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/tasks/:taskId', (req, res, ctx) => {
        const { projectId, taskId } = req.params;
        const tasks = getProjectsFromStorage().find(
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
