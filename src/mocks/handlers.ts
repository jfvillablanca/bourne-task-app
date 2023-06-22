import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

import { mockProjects } from './fixtures';
import { ProjectDocument, UpdateProjectDto } from '../common';



const PROJECTS_STORAGE_KEY = 'projects';

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

    rest.get('/api/projects/:projectId/tasks', (req, res, ctx) => {
        const { projectId } = req.params;
        const tasks = getProjectsFromStorage().find(
            (project) => project._id === projectId,
        )?.tasks;

        return res(ctx.json(tasks ?? []), ctx.status(HttpStatusCode.Ok));
    }),
];
