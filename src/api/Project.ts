import { useQuery } from '@tanstack/react-query';

import { ProjectDocument } from '../common';

import { get } from '.';

export const Project = {
    useFindAll: () =>
        useQuery({
            queryKey: ['projects'],
            queryFn: () => getProjects(),
        }),

    useFindOne: (projectId: string) =>
        useQuery({
            queryKey: ['projects', projectId],
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
