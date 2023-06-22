import { setupServer } from 'msw/node';

import { screen, waitFor } from '@testing-library/react';

import App from '../App';
import { TaskDocument } from '../common';
import { CardView } from '../components';
import { mockProjects } from '../mocks/fixtures';
import { handlers } from '../mocks/handlers';

import { renderWithClient } from './utils';

const server = setupServer(...handlers);

beforeAll(() => server.listen());

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('App', () => {
    it('should render all project titles', async () => {
        const result = renderWithClient(<App />);

        await waitFor(() => result.findByText(/my projects/i));

        const projectTitles = screen
            .getAllByRole('listitem')
            .map((project) => project.textContent);

        expect(projectTitles).toHaveLength(5);
    });

    it('should render an initial list of tasks', async () => {
        const mockProjectTasks = mockProjects()[0].tasks;
        renderWithClient(<App />);

        await waitFor(() => {
            mockProjectTasks.forEach((task) => {
                expect(screen.getByText(task.title)).toBeInTheDocument();
            });
        });
    });
});

describe('CardView', () => {
    it('should render task card groups', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTaskStates = mockProjects()[0].taskStates;
        const mockTasks = mockProjects()[0].tasks;
        const groupedTasks = mockTasks.reduce((acc, task) => {
            const { taskState } = task;
            if (!acc[taskState]) {
                acc[taskState] = [];
            }
            acc[taskState].push(task);
            return acc;
        }, {} as { [key: string]: TaskDocument[] });

        renderWithClient(<CardView projectId={mockProjectId} />);

        await waitFor(() => {
            mockProjectTaskStates.forEach((taskState) => {
                const tasksInState = groupedTasks[taskState];
                tasksInState.forEach((task) => {
                    expect(screen.getByText(task.title)).toBeInTheDocument();
                });
            });
        });
    });

    it('should correctly group tasks to the correct task card group', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTaskStates = mockProjects()[0].taskStates;

        renderWithClient(<CardView projectId={mockProjectId} />);

        await waitFor(() => {
            mockProjectTaskStates.forEach((taskState) => {
                expect(screen.getByText(taskState)).toBeInTheDocument();
            });
        });
    });

    it('should render the project title', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTitle = mockProjects()[0].title;

        const result = renderWithClient(<CardView projectId={mockProjectId} />);

        await waitFor(() =>
            expect(result.getByText(mockProjectTitle)).toBeInTheDocument(),
        );
    });
});
