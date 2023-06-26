import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

import { ProjectDocument, ProjectMember, UpdateProjectDto } from '../common';

import { mockProjects, mockUsers } from './fixtures';


const PROJECTS_STORAGE_KEY = 'projects';
const USERS_STORAGE_KEY = 'users';

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

const getProjectMemberFromStorage = (userId: string) => {
    const storedData = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedData) {
        const userList: ProjectMember[] = JSON.parse(storedData);
        return userList.find((user) => user._id === userId);
    } else {
        const initialData = mockUsers();
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialData));
        return initialData.find((user) => user._id === userId);
    }
};

const postProjectToStorage = ({
    id,
    payload,
}: {
    id: string;
    payload: UpdateProjectDto;
}) => {
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

        // TODO: Should I mock db creation of new project
        // HACK: return first project
        return parsedData[0];
    }
};

export const handlers = [
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
            return getProjectMemberFromStorage(id);
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
];
