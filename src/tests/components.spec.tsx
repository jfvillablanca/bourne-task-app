import { setupServer } from 'msw/node';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { TaskDocument } from '../common';
import { CardView, ProjectTitle, TaskCard } from '../components';
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
describe('ProjectTitle', () => {
    it('should render the project title', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTitle = mockProjects()[0].title;

        const result = renderWithClient(
            <ProjectTitle projectId={mockProjectId} />,
        );

        await waitFor(() =>
            expect(result.getByText(mockProjectTitle)).toBeInTheDocument(),
        );
    });

    it('should toggle project title header to a form input', async () => {
        const user = userEvent.setup();

        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTitle = mockProjects()[0].title;
        const result = renderWithClient(
            <ProjectTitle projectId={mockProjectId} />,
        );
        await waitFor(() =>
            expect(result.getByText(mockProjectTitle)).toBeInTheDocument(),
        );

        const titleHeader = result.getByText(mockProjectTitle);

        await user.click(titleHeader);

        const titleInput = result.getByDisplayValue(mockProjectTitle);
        expect(titleInput).toBeInTheDocument();
        expect(titleInput).toHaveFocus();
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
                if (tasksInState) {
                    tasksInState.forEach((task) => {
                        expect(
                            screen.getByTestId(`task-card-${task._id}`),
                        ).toBeInTheDocument();
                    });
                }
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
});

describe('TaskCard', () => {
    it('should render an avatar for assigned member', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockTask = mockProjects()[0].tasks[0];
        const mockNoOfAssignedMembers = mockTask.assignedProjMemberId.length;

        const result = renderWithClient(
            <TaskCard task={mockTask} projectId={mockProjectId} />,
        );

        await waitFor(() =>
            expect(result.getByRole('img')).toBeInTheDocument(),
        );

        expect(screen.getAllByRole('img').length).toBe(mockNoOfAssignedMembers);
    });
});
