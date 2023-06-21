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
            taskStates: ["todo", "doing", "done"],
            tasks: [
                {
                    title: 'Optimize Matrix Multiplication Algorithm',
                    taskState: "done",
                    description:
                        'Improve the efficiency of multiplying two matrices.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edef',
                },
                {
                    title: 'Prove the Collatz Conjecture',
                    taskState: "todo",
                    description:
                        'Determine whether every positive integer will eventually reach 1.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf0',
                },
                {
                    title: 'Implement Depth-First Search Algorithm',
                    taskState: "doing",
                    description: 'Traverse a graph in depth-first order.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf1',
                },
                {
                    title: 'Implement QuickSort Algorithm',
                    taskState: "todo",
                    description:
                        'Write a function to sort an array using the QuickSort algorithm.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf6',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62e3c9ce700ba3f9ede7',
            title: 'Code Refactoring',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: ['648f64fcc9ce700ba3f9edf2'],
            taskStates: ["todo", "doing", "done"],
            tasks: [
                {
                    title: 'Revert commit HEAD~2',
                    taskState: "todo",
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
            taskStates: ["todo", "doing", "done"],
            tasks: [
                {
                    title: 'Implement Binary Search Algorithm',
                    taskState: "todo",
                    description:
                        'Write a function to perform binary search on a sorted array.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9eded',
                },
                {
                    title: 'Solve the Traveling Salesman Problem',
                    taskState: "doing",
                    description:
                        'Find the shortest possible route that visits each city exactly once.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edee',
                },
                {
                    title: 'Solve the Tower of Hanoi Puzzle',
                    taskState: "todo",
                    description:
                        'Move all the disks from one peg to another using the rules of the Tower of Hanoi puzzle.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf5',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62d3c9ce700ba3f9ede5',
            title: 'Test Automation',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: [],
            taskStates: ["todo", "doing", "done"],
            tasks: [
                {
                    title: 'Find the meaning of life',
                    taskState: "todo",
                    description: 'Traverse a graph in depth-first order.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf1',
                },
                {
                    title: 'Find the Nth Fibonacci Number',
                    taskState: "todo",
                    description:
                        'Write a function to calculate the Nth number in the Fibonacci sequence.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf2',
                },
                {
                    title: 'Build a Simple Calculator',
                    taskState: "todo",
                    description:
                        'Create a basic calculator application with addition, subtraction, multiplication, and division.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf3',
                },
                {
                    title: "Implement Dijkstra's Algorithm",
                    taskState: "todo",
                    description:
                        "Find the shortest path between nodes in a graph using Dijkstra's algorithm.",
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf4',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
        {
            _id: '648f62d3c9ce700ba3f9kde9',
            title: 'UI/UX Enhancements',
            ownerId: '648f629dc9ce700ba3f9ede0',
            collaborators: [],
            taskStates: ["todo", "doing", "done"],
            tasks: [
                {
                    title: 'Solve the Traveling Salesman Problem',
                    taskState: "todo",
                    description:
                        'Find the shortest possible route that visits each city exactly once.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edee',
                },
                {
                    title: 'Optimize Matrix Multiplication Algorithm',
                    taskState: "todo",
                    description:
                        'Improve the efficiency of multiplying two matrices.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edef',
                },
                {
                    title: 'Prove the Collatz Conjecture',
                    taskState: "done",
                    description:
                        'Determine whether every positive integer will eventually reach 1.',
                    assignedProjMemberId: [],
                    _id: '648f63abc9ce700ba3f9edf0',
                },
            ],
            createdAt: '2023-06-18T20:02:27.306Z',
            updatedAt: '2023-06-18T20:02:27.306Z',
        },
    ];
};
