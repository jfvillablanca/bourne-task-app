import { AxiosError } from 'axios';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TaskDocument, TaskDto, UpdateTaskDto } from '../common';

import { Auth, destroy, get, patch, post } from '.';

export const Task = {
    queryKeys: {
        all: (projectId: string) => ['tasks', projectId] as const,
        byId: (projectId: string, taskId: string) =>
            [...Task.queryKeys.all(projectId), taskId] as const,
    },

    useCreate: (projectId: string) => {
        const queryClient = useQueryClient();
        const refreshToken = Auth.useTokenRefresh();
        return useMutation<TaskDocument, AxiosError['response'], TaskDto>({
            mutationFn: (createdFields: TaskDto) =>
                refreshToken(() => createTask(projectId, createdFields)),
            onSuccess: () => {
                return queryClient.invalidateQueries({
                    queryKey: Task.queryKeys.all(projectId),
                });
            },
        });
    },

    useFindAll: (projectId: string) => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<TaskDocument[], AxiosError['response']>({
            queryKey: Task.queryKeys.all(projectId),
            queryFn: () => refreshToken(() => getTasks(projectId)),
        });
    },

    useFindOne: (projectId: string, taskId: string, isEnabled = true) => {
        const refreshToken = Auth.useTokenRefresh();
        return useQuery<TaskDocument, AxiosError['response']>({
            enabled: isEnabled,
            queryKey: Task.queryKeys.byId(projectId, taskId),
            queryFn: () => refreshToken(() => getTaskById(projectId, taskId)),
        });
    },

    useUpdate: (projectId: string, taskId: string) => {
        const queryClient = useQueryClient();
        const refreshToken = Auth.useTokenRefresh();
        return useMutation<TaskDocument, AxiosError['response'], UpdateTaskDto>(
            {
                mutationFn: (updatedFields: UpdateTaskDto) =>
                    refreshToken(() =>
                        updateTask(projectId, taskId, updatedFields),
                    ),
                onSuccess: () => {
                    return queryClient.invalidateQueries({
                        queryKey: Task.queryKeys.all(projectId),
                    });
                },
            },
        );
    },

    useRemove: (projectId: string, taskId: string) => {
        const queryClient = useQueryClient();
        const refreshToken = Auth.useTokenRefresh();
        return useMutation<boolean, AxiosError['response'], void>({
            mutationFn: () => refreshToken(() => removeTask(projectId, taskId)),
            onSuccess: () => {
                return queryClient.invalidateQueries({
                    queryKey: Task.queryKeys.all(projectId),
                });
            },
        });
    },

    filterByTaskState: (allTasks: TaskDocument[], taskState: string) => {
        return allTasks.filter((task) => task.taskState === taskState);
    },
};

const createTask = async (
    projectId: string,
    createdFields: TaskDto,
): Promise<TaskDocument> => {
    const response = await post(
        `/api/projects/${projectId}/tasks`,
        createdFields,
    );
    return response.data;
};

const getTasks = async (projectId: string): Promise<TaskDocument[]> => {
    const response = await get(`/api/projects/${projectId}/tasks`);
    return response.data;
};

const getTaskById = async (
    projectId: string,
    taskId: string,
): Promise<TaskDocument> => {
    const response = await get(`/api/projects/${projectId}/tasks/${taskId}`);
    return response.data;
};

const updateTask = async (
    projectId: string,
    taskId: string,
    updatedFields: UpdateTaskDto,
): Promise<TaskDocument> => {
    const response = await patch(
        `/api/projects/${projectId}/tasks/${taskId}`,
        updatedFields,
    );
    return response.data;
};

const removeTask = async (projectId: string, taskId: string) => {
    await destroy(`/api/projects/${projectId}/tasks/${taskId}`);
    return true;
};
