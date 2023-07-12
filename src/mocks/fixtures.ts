import { MockedUser, ProjectDocument } from '../common';

import { testOwner } from './mockUsersTestUtils';

export const mockUsers = (): MockedUser[] => [
    {
        _id: testOwner._id,
        email: testOwner.email,
        hashed_password: testOwner.password,
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec2292788',
        email: 'samantha.turner@outlook.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278a',
        email: 'michael.white@example.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278c',
        email: 'robert.jackson@gmail.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278d',
        email: 'john.doe@example.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278e',
        email: 'jennifer.smith@gmail.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278f',
        email: 'david123@yahoo.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278g',
        email: 'emily.jones@outlook.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278h',
        email: 'alexanderbrown@hotmail.com',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
    {
        _id: '64956dead2af038ec229278i',
        email: 'sarah.wilson@example.org',
        hashed_password: 'fake_hash',
        refresh_token: 'fake_token',
    },
];

export const mockProjects = (): ProjectDocument[] => {
    return [
        {
            _id: '648f62d3c9ce700ba3f9ede4',
            title: 'Customer Feedback Implementation',
            description: 'Add CTA form at end of lifecycle',
            ownerId: testOwner._id,
            collaborators: [
                '64956dead2af038ec2292788',
                '64956dead2af038ec229278c',
                '64956dead2af038ec229278g',
                '64956dead2af038ec229278h',
            ],
            taskStates: ['todo', 'doing', 'done', 'archived'],
            tasks: [
                {
                    title: 'Optimize Matrix Multiplication Algorithm',
                    taskState: 'archived',
                    description:
                        'Improve the efficiency of multiplying two matrices.',
                    subtasks: [],
                    assignedProjMemberId: ['64956dead2af038ec229278g'],
                    _id: '648f63abc9ce700ba3f9edef',
                },
                {
                    title: 'Prove the Collatz Conjecture',
                    taskState: 'todo',
                    description:
                        'Determine whether every positive integer will eventually reach 1.',
                    subtasks: [
                        { title: 'Find Waldo', isCompleted: false },
                        {
                            title: "Solve Fermat's Last Theorem",
                            isCompleted: true,
                        },
                        { title: 'Write a Novel', isCompleted: false },
                    ],
                    assignedProjMemberId: [
                        '64956dead2af038ec2292788',
                        '64956dead2af038ec229278c',
                        '64956dead2af038ec229278g',
                        '64956dead2af038ec229278h',
                    ],
                    _id: '648f63abc9ce700ba3f9edf0',
                },
                {
                    title: 'Implement Depth-First Search Algorithm',
                    taskState: 'doing',
                    description: 'Traverse a graph in depth-first order.',
                    subtasks: [
                        { title: 'Find Waldo', isCompleted: false },
                        {
                            title: "Solve Fermat's Last Theorem",
                            isCompleted: true,
                        },
                        { title: 'Write a Novel', isCompleted: false },
                    ],
                    assignedProjMemberId: ['64956dead2af038ec229278g'],
                    _id: '648f63abc9ce700ba3f9edf1',
                },
                {
                    title: 'Implement QuickSort Algorithm',
                    taskState: 'todo',
                    description:
                        'Write a function to sort an array using the QuickSort algorithm.',
                    subtasks: [
                        { title: 'Find Waldo', isCompleted: false },
                        {
                            title: "Solve Fermat's Last Theorem",
                            isCompleted: true,
                        },
                        { title: 'Write a Novel', isCompleted: false },
                    ],
                    assignedProjMemberId: ['64956dead2af038ec229278g'],
                    _id: '648f63abc9ce700ba3f9edf6',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62e3c9ce700ba3f9ede7',
            title: 'Code Refactoring',
            ownerId: testOwner._id,
            collaborators: [
                '64956dead2af038ec229278h',
                '64956dead2af038ec229278g',
            ],
            taskStates: ['todo', 'doing', 'done'],
            tasks: [
                {
                    title: 'Revert commit HEAD~2',
                    taskState: 'todo',
                    assignedProjMemberId: [
                        '64956dead2af038ec229278h',
                        '64956dead2af038ec229278g',
                    ],
                    _id: '648f63abc9ce700ba3f9eded',
                },
            ],
            createdAt: '2023-06-18T20:02:43.870Z',
            updatedAt: '2023-06-18T20:12:24.569Z',
        },
        {
            _id: '648fi2d3c9ce700ba3f9ede4',
            title: 'Performance Optimization',
            ownerId: testOwner._id,
            collaborators: [
                '64956dead2af038ec229278h',
                '64956dead2af038ec229278g',
            ],
            taskStates: ['todo', 'doing', 'done'],
            tasks: [
                {
                    title: 'Implement Binary Search Algorithm',
                    taskState: 'todo',
                    description:
                        'Write a function to perform binary search on a sorted array.',
                    subtasks: [
                        { title: 'Find Waldo', isCompleted: false },
                        {
                            title: "Solve Fermat's Last Theorem",
                            isCompleted: true,
                        },
                        { title: 'Write a Novel', isCompleted: false },
                    ],
                    assignedProjMemberId: ['64956dead2af038ec229278h'],
                    _id: '648f63abc9ce700ba3f9eded',
                },
                {
                    title: 'Solve the Traveling Salesman Problem',
                    taskState: 'doing',
                    description:
                        'Find the shortest possible route that visits each city exactly once.',
                    subtasks: [
                        { title: 'Find Waldo', isCompleted: false },
                        {
                            title: "Solve Fermat's Last Theorem",
                            isCompleted: true,
                        },
                        { title: 'Write a Novel', isCompleted: false },
                    ],
                    assignedProjMemberId: [
                        '64956dead2af038ec229278h',
                        '64956dead2af038ec229278h',
                    ],
                    _id: '648f63abc9ce700ba3f9edee',
                },
                {
                    title: 'Solve the Tower of Hanoi Puzzle',
                    taskState: 'todo',
                    description:
                        'Move all the disks from one peg to another using the rules of the Tower of Hanoi puzzle.',
                    assignedProjMemberId: ['64956dead2af038ec229278h'],
                    _id: '648f63abc9ce700ba3f9edf5',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62d3c9ce700ba3f9ede5',
            title: 'Test Automation',
            ownerId: testOwner._id,
            collaborators: [
                '64956dead2af038ec229278h',
                '64956dead2af038ec229278a',
            ],
            taskStates: ['todo', 'doing', 'done'],
            tasks: [
                {
                    title: 'Find the meaning of life',
                    taskState: 'todo',
                    description: 'Traverse a graph in depth-first order.',
                    assignedProjMemberId: ['64956dead2af038ec229278h'],
                    _id: '648f63abc9ce700ba3f9edf1',
                },
                {
                    title: 'Find the Nth Fibonacci Number',
                    taskState: 'todo',
                    description:
                        'Write a function to calculate the Nth number in the Fibonacci sequence.',
                    assignedProjMemberId: ['64956dead2af038ec229278h'],
                    _id: '648f63abc9ce700ba3f9edf2',
                },
                {
                    title: 'Build a Simple Calculator',
                    taskState: 'todo',
                    description:
                        'Create a basic calculator application with addition, subtraction, multiplication, and division.',
                    assignedProjMemberId: ['64956dead2af038ec229278h'],
                    _id: '648f63abc9ce700ba3f9edf3',
                },
                {
                    title: "Implement Dijkstra's Algorithm",
                    taskState: 'todo',
                    description:
                        "Find the shortest path between nodes in a graph using Dijkstra's algorithm.",
                    assignedProjMemberId: [
                        '64956dead2af038ec229278h',
                        '64956dead2af038ec229278a',
                    ],
                    _id: '648f63abc9ce700ba3f9edf4',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62d3c9ce700ba3f9kde9',
            title: 'UI/UX Enhancements',
            ownerId: testOwner._id,
            collaborators: ['64956dead2af038ec229278a'],
            taskStates: ['todo', 'doing', 'done'],
            tasks: [
                {
                    title: 'Solve the Traveling Salesman Problem',
                    taskState: 'todo',
                    description:
                        'Find the shortest possible route that visits each city exactly once.',
                    assignedProjMemberId: ['64956dead2af038ec229278c'],
                    _id: '648f63abc9ce700ba3f9edee',
                },
                {
                    title: 'Optimize Matrix Multiplication Algorithm',
                    taskState: 'todo',
                    description:
                        'Improve the efficiency of multiplying two matrices.',
                    assignedProjMemberId: ['64956dead2af038ec229278c'],
                    _id: '648f63abc9ce700ba3f9edef',
                },
                {
                    title: 'Prove the Collatz Conjecture',
                    taskState: 'done',
                    description:
                        'Determine whether every positive integer will eventually reach 1.',
                    assignedProjMemberId: ['64956dead2af038ec229278c'],
                    _id: '648f63abc9ce700ba3f9edf0',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
    ];
};
