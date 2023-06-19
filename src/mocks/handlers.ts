import { HttpStatusCode } from 'axios';
import { rest } from 'msw';

import { mockProjects } from './fixtures';

export const handlers = [
    rest.get('/api/projects', (_req, res, ctx) => {
        return res(ctx.json(mockProjects()), ctx.status(HttpStatusCode.Ok));
    }),
];
