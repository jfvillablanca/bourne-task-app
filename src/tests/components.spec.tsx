import { HttpStatusCode } from 'axios';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it, vi } from 'vitest';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { TaskDocument } from '../common';
import { CardView, ProjectTitle, TaskCard, TaskModal } from '../components';
import { mockProjects } from '../mocks/fixtures';
import { handlers } from '../mocks/handlers';

import { renderWithClient } from './utils';

const server = setupServer(...handlers);

beforeAll(() => {
    window.ResizeObserver =
        window.ResizeObserver ||
        vi.fn().mockImplementation(() => ({
            disconnect: vi.fn(),
            observe: vi.fn(),
            unobserve: vi.fn(),
        }));

    server.listen();
});

afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
});

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

    it('should open a modal to add new project', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<App />);
        await waitFor(() => result.findByText(/my projects/i));
        const addNewProjectButton = result.getByTestId('add-new-project');

        await user.click(addNewProjectButton);

        const titleInput = result.getByPlaceholderText(/name your project/i);
        const descriptionInput =
            result.getByPlaceholderText(/project summary/i);

        await user.type(titleInput, 'new project');

        expect(titleInput).toBeInTheDocument();
        expect(descriptionInput).toBeInTheDocument();
        expect(titleInput).toHaveValue('new project');
    });

    it('should render toast notification on error', async () => {
        server.use(
            rest.get('/api/projects', (_req, res, ctx) => {
                return res(ctx.status(HttpStatusCode.InternalServerError));
            }),
        );
        const result = renderWithClient(<App />);

        await waitFor(() =>
            expect(
                result.getByText(/something went wrong/i),
            ).toBeInTheDocument(),
        );
    });
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

        const titleHeader = result.getByTestId(
            `project-title-${mockProjectId}`,
        );

        await user.click(titleHeader);

        const titleInput = result.getByTestId(
            `project-input-edit-title-${mockProjectId}`,
        );
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
        const mockNoOfAssignedMembers = mockTask.assignedProjMemberId?.length;

        const result = renderWithClient(
            <TaskCard task={mockTask} projectId={mockProjectId} />,
        );

        await waitFor(() =>
            expect(result.getByRole('img')).toBeInTheDocument(),
        );

        expect(screen.getAllByRole('img').length).toBe(mockNoOfAssignedMembers);
    });

    it('should open a modal dialog on click of edit button', async () => {
        const user = userEvent.setup();

        const mockProjectId = mockProjects()[0]._id;
        const mockTask = mockProjects()[0].tasks[0];
        const mockTaskId = mockTask._id;
        const result = renderWithClient(
            <TaskCard task={mockTask} projectId={mockProjectId} />,
        );
        await waitFor(() =>
            expect(result.getByRole('img')).toBeInTheDocument(),
        );

        const taskCardEditButton = result.getByTestId(
            `open-task-modal-${mockTaskId}`,
        );

        await user.click(taskCardEditButton);

        const taskModal = result.getByTestId(`task-modal-${mockTaskId}`);
        expect(taskModal).toBeInTheDocument();
        expect(taskModal).toHaveAttribute('role', 'dialog');
    });
});

describe('TaskModal', () => {
    it('should be able to edit the task title', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockTask = mockProjects()[0].tasks[0];
        const mockTaskId = mockTask._id;
        const result = renderWithClient(
            <TaskModal taskId={mockTaskId} projectId={mockProjectId}>
                <button></button>
            </TaskModal>,
        );
        const taskCardEditButton = result.getByTestId(
            `open-task-modal-${mockTaskId}`,
        );
        await user.click(taskCardEditButton);

        await waitFor(() =>
            expect(
                result.getByTestId(`task-modal-${mockTaskId}`),
            ).toBeInTheDocument(),
        );

        const titleInput = result.getByPlaceholderText(
            /what are we working on?/i,
        );
        await user.type(titleInput, ': Electric Boogaloo');

        expect(titleInput).toHaveValue(`${mockTask.title}: Electric Boogaloo`);
    });
});
