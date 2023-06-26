import { useQuery } from '@tanstack/react-query';

import { TaskDocument } from '../common';

import { get } from '.';

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
