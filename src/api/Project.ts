import { useQuery } from '@tanstack/react-query';

import { ProjectDocument } from '../common';

import { get } from '.';

export const Project = {
    queryKeys: {
        all: ['projects'] as const,
        byId: (id: string) => [...Project.queryKeys.all, id] as const,
    },

    useFindAll: () =>
        useQuery({
            queryKey: Project.queryKeys.all,
            queryFn: () => getProjects(),
        }),

    useFindOne: (projectId: string) =>
        useQuery({
            queryKey: Project.queryKeys.byId(projectId),
            queryFn: () => getProjectById(projectId),
        }),
};

const getProjects = async (): Promise<ProjectDocument[]> => {
    const response = await get('/api/projects');
    return response.data;
};

const getProjectById = async (projectId: string): Promise<ProjectDocument> => {
    const response = await get(`/api/projects/${projectId}`);
    return response.data;
};
