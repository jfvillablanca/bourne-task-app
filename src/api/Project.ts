import { useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    ProjectDocument,
    ProjectDto,
    ProjectMember,
    UpdateProjectDto,
} from '../common';

import { get, patch, post } from '.';

export const Project = {
    queryKeys: {
        all: ['projects'] as const,
        byId: (id: string) => [...Project.queryKeys.all, id] as const,
        members: (id: string) =>
            [...Project.queryKeys.byId(id), 'members'] as const,
    },

    useCreate: () => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (createdFields: ProjectDto) =>
                createProject(createdFields),
            onSuccess: () => {
                return queryClient.invalidateQueries({
                    queryKey: Project.queryKeys.all,
                });
            },
        });
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

    useGetProjectMembers: (projectId: string) =>
        useQuery({
            queryKey: Project.queryKeys.members(projectId),
            queryFn: () => getProjectMembers(projectId),
        }),

    useGetTaskStates: (projectId: string) =>
        useQuery({
            queryKey: Project.queryKeys.byId(projectId),
            queryFn: () => getProjectById(projectId),
            select: useCallback((data: ProjectDocument) => data.taskStates, []),
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

const createProject = async (
    createdFields: ProjectDto,
): Promise<ProjectDocument> => {
    const response = await post(`/api/projects`, createdFields);
    return response.data;
};

const getProjects = async (): Promise<ProjectDocument[]> => {
    const response = await get('/api/projects');
    return response.data;
};

const getProjectById = async (projectId: string): Promise<ProjectDocument> => {
    const response = await get(`/api/projects/${projectId}`);
    return response.data;
};

const getProjectMembers = async (
    projectId: string,
): Promise<ProjectMember[]> => {
    const response = await get(`/api/projects/${projectId}/members`);
    return response.data;
};

const updateProject = async (
    projectId: string,
    updatedFields: UpdateProjectDto,
): Promise<ProjectDocument> => {
    const response = await patch(`/api/projects/${projectId}`, updatedFields);
    return response.data;
};
