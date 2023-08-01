import { AxiosError } from 'axios';
import { useCallback } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    ProjectDocument,
    ProjectDto,
    ProjectMember,
    UpdateProjectDto,
} from '../common';

import { Auth, destroy, get, patch, post } from '.';

export const Project = {
    queryKeys: {
        all: ['projects'] as const,
        byId: (id: string) => [...Project.queryKeys.all, id] as const,
        members: (id: string) =>
            [...Project.queryKeys.byId(id), 'members'] as const,
    },

    useCreate: () => {
        const queryClient = useQueryClient();
        const refreshToken = Auth.useTokenRefresh();
        return useMutation<ProjectDocument, AxiosError['response'], ProjectDto>(
            {
                mutationFn: (createdFields: ProjectDto) =>
                    refreshToken(() => createProject(createdFields)),
                onSuccess: () => {
                    return queryClient.invalidateQueries({
                        queryKey: Project.queryKeys.all,
                    });
                },
            },
        );
    },

    useFindAll: () => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<ProjectDocument[], AxiosError['response']>({
            queryKey: Project.queryKeys.all,
            queryFn: () => refreshToken(() => getProjects()),
        });
    },

    useFindOne: (projectId: string) => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<ProjectDocument, AxiosError['response']>({
            queryKey: Project.queryKeys.byId(projectId),
            queryFn: () => refreshToken(() => getProjectById(projectId)),
        });
    },

    useGetProjectMembers: (projectId: string) => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<ProjectMember[], AxiosError['response']>({
            queryKey: Project.queryKeys.members(projectId),
            queryFn: () => refreshToken(() => getProjectMembers(projectId)),
        });
    },

    useGetTaskStates: (projectId: string) => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<ProjectDocument, AxiosError['response'], string[]>({
            queryKey: Project.queryKeys.byId(projectId),
            queryFn: () => refreshToken(() => getProjectById(projectId)),
            select: useCallback((data: ProjectDocument) => data.taskStates, []),
        });
    },

    useUpdate: (projectId: string) => {
        const queryClient = useQueryClient();
        const refreshToken = Auth.useTokenRefresh();
        return useMutation<
            ProjectDocument,
            AxiosError['response'],
            UpdateProjectDto
        >({
            mutationFn: (updatedFields: UpdateProjectDto) =>
                refreshToken(() => updateProject(projectId, updatedFields)),
            onSuccess: () => {
                return queryClient.invalidateQueries({
                    queryKey: Project.queryKeys.all,
                });
            },
        });
    },

    useRemove: (projectId: string) => {
        const queryClient = useQueryClient();
        const refreshToken = Auth.useTokenRefresh();
        return useMutation<boolean, AxiosError['response'], void>({
            mutationFn: () => refreshToken(() => removeProject(projectId)),
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

const removeProject = async (projectId: string) => {
    await destroy(`/api/projects/${projectId}`);
    return true;
};
