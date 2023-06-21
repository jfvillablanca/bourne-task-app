import { useQuery } from '@tanstack/react-query';

import { TaskDocument } from '../common';

import { get } from '.';

export const Task = {
    useFindAll: (projectId: string) =>
        useQuery({
            queryKey: ['tasks', projectId],
            queryFn: () => getTasks(projectId),
        }),
};

const getTasks = async (projectId: string): Promise<TaskDocument[]> => {
    const response = await get(`/api/projects/${projectId}/tasks`);
    return response.data;
};
