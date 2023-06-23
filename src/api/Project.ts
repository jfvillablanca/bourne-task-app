import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ProjectDocument, UpdateProjectDto } from '../common';

import { get, patch } from '.';

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

    useUpdate: (projectId: string) => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (updatedFields: UpdateProjectDto) =>
                updateProject(projectId, updatedFields),
            onSuccess: () => {
                return queryClient.invalidateQueries({
                    queryKey: Project.queryKeys.all,
                });
            },
        });
    },
};

// TODO: add authorization tokens to config argument to these verbs wherever necessary
// const config = {
//     headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer <token>',
//     }
// }

const getProjects = async (): Promise<ProjectDocument[]> => {
    const response = await get('/api/projects');
    return response.data;
};

const getProjectById = async (projectId: string): Promise<ProjectDocument> => {
    const response = await get(`/api/projects/${projectId}`);
    return response.data;
};

const updateProject = async (
    projectId: string,
    updatedFields: UpdateProjectDto,
): Promise<ProjectDocument> => {
    const response = await patch(`/api/projects/${projectId}`, updatedFields);
    return response.data;
};
