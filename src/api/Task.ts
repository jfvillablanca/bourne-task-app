import { useQuery } from '@tanstack/react-query';

import { TaskDocument } from '../common';

import { get } from '.';

export const Task = {
    queryKeys: {
        allByProjectId: (projectId: string) => ['tasks', projectId] as const,
    },

    useFindAll: (projectId: string) =>
        useQuery({
            queryKey: Task.queryKeys.allByProjectId(projectId),
            queryFn: () => getTasks(projectId),
        }),

    filterByTaskState: (allTasks: TaskDocument[], taskState: string) => {
        return allTasks.filter((task) => task.taskState === taskState);
    },
};

const getTasks = async (projectId: string): Promise<TaskDocument[]> => {
    const response = await get(`/api/projects/${projectId}/tasks`);
    return response.data;
};
