import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

import { mockProjects } from './fixtures';

export const handlers = [
    rest.get('/api/projects', (_req, res, ctx) => {
        return res(ctx.json(mockProjects()), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId', (req, res, ctx) => {
        const { projectId } = req.params;
        const project = mockProjects().find(
            (project) => project._id === projectId,
        );
        return res(ctx.json(project), ctx.status(HttpStatusCode.Ok));
    }),

    rest.get('/api/projects/:projectId/tasks', (req, res, ctx) => {
        const { projectId } = req.params;
        const tasks = mockProjects().find(
            (project) => project._id === projectId,
        )?.tasks;

        return res(ctx.json(tasks ?? []), ctx.status(HttpStatusCode.Ok));
    }),
];
