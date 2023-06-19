import { ProjectDocument } from '../common';

export const mockTokens = () => {
    return {
        access_token: 'qwfpluy;',
        refresh_token: 'arsnteio',
    };
};

export const mockProjects = (): ProjectDocument[] => {
    return [
        {
            _id: '648f62d3c9ce700ba3f9ede4',
            title: 'Customer Feedback Implementation',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: [],
            tasks: [],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62e3c9ce700ba3f9ede7',
            title: 'Code Refactoring',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: ['648f64fcc9ce700ba3f9edf2'],
            tasks: [
                {
                    title: 'Revert commit HEAD~2',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9eded',
                },
            ],
            createdAt: '2023-06-18T20:02:43.870Z',
            updatedAt: '2023-06-18T20:12:24.569Z',
        },
        {
            _id: '648fi2d3c9ce700ba3f9ede4',
            title: 'Performance Optimization',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: [],
            tasks: [],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62d3c9ce700ba3f9ede5',
            title: 'Test Automation',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: [],
            tasks: [],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62d3c9ce700ba3f9kde9',
            title: 'UI/UX Enhancements',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: [],
            tasks: [],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
    ];
};

export const newPostTask = () => {
    return {
        title: 'My first task',
        assignedProjMemberId: [],
        _id: '648f63abc9ce700ba3f9eded',
    };
};

export const getProjectMembers = () => {
    return ['648f629dc9ce700ba3f9ede0', '648f64fcc9ce700ba3f9edf2'];
};
