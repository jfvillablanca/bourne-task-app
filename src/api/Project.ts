import { useQuery } from '@tanstack/react-query';

import { ProjectDocument } from '../common';

import { get } from '.';

export const Project = {
    useFindAll: () =>
        useQuery({
            queryKey: ['projects'],
            queryFn: () => getProjects(),
        }),
};

const getProjects = async (): Promise<ProjectDocument[]> => {
    const response = await get('/api/projects');
    return response.data;
};
