import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TaskDocument, UpdateTaskDto } from '../common';

import { get, patch } from '.';

export const Task = {
    queryKeys: {
        all: (projectId: string) => ['tasks', projectId] as const,
        byId: (projectId: string, taskId: string) =>
            [...Task.queryKeys.all(projectId), taskId] as const,
    },

    useFindAll: (projectId: string) =>
        useQuery({
            queryKey: Task.queryKeys.all(projectId),
            queryFn: () => getTasks(projectId),
        }),

    useFindOne: (projectId: string, taskId: string) =>
        useQuery({
            queryKey: Task.queryKeys.byId(projectId, taskId),
            queryFn: () => getTaskById(projectId, taskId),
        }),

    useUpdate: (projectId: string, taskId: string) => {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (updatedFields: UpdateTaskDto) =>
                updateTask(projectId, taskId, updatedFields),
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
