import { HttpStatusCode } from 'axios';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { describe, it } from 'vitest';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App';
import { TaskDocument } from '../common';
import {
    CardView,
    ProjectTitle,
    TaskCard,
    TaskCardGroup,
    TaskModal,
} from '../components';
import { mockProjects, mockUsers } from '../mocks/fixtures';
import { handlers } from '../mocks/handlers';
import {
    clearTestAccessTokenFromLocalStorage,
    populateMockDatabase,
    renderWithClient,
    setTestAccessTokenToLocalStorage,
} from '../tests/utils';

const server = setupServer(...handlers);

beforeAll(() => {
    server.listen();
});

beforeEach(() => {
    populateMockDatabase();
});

afterEach(() => {
    localStorage.clear();
    server.resetHandlers();
});

afterAll(() => server.close());

describe.shuffle('App', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('should render all project titles', async () => {
        const mockProjectTitle = mockProjects()[0].title;
        const result = renderWithClient(<App />);

        await waitFor(() => result.findByText(mockProjectTitle));

        const projectTitles = screen
            .getAllByRole('listitem')
            .map((project) => project.textContent);

        expect(projectTitles).toHaveLength(5);
    });

    it('should render skeletons if projects are still being fetched', async () => {
        const result = renderWithClient(<App />);

        const skeletons = result.getAllByLabelText('loading');

        expect(skeletons).toHaveLength(3);
    });

    it('should open a modal to add new project', async () => {
        const user = userEvent.setup();
        const result = renderWithClient(<App />);
        await waitFor(() => result.findByText(/my projects/i));
        const addNewProjectButton = result.getByTestId('add-new-project');

        await user.click(addNewProjectButton);

        const titleInput = result.getByPlaceholderText(/new project name/i);
        const descriptionInput = result.getByPlaceholderText(
            /short summary of the project/i,
        );

        await user.type(titleInput, 'new project');

        expect(titleInput).toBeInTheDocument();
        expect(descriptionInput).toBeInTheDocument();
        expect(titleInput).toHaveValue('new project');
    });

    it('should open a modal to confirm project deletion', async () => {
        const user = userEvent.setup();
        // This project title is assured to load. App is loaded with mockProjects() in dev mode.
        const mockProjectTitle = mockProjects()[0].title;

        const result = renderWithClient(<App />);

        // Click on the first project title
        await waitFor(() => result.findByText(mockProjectTitle));
        const selectedProject = result.getByText(mockProjectTitle);
        await user.click(selectedProject);

        const deleteProjectButton = result.getByLabelText('delete project');
        await user.click(deleteProjectButton);

        const confirmDeleteProjectButton = result.getByLabelText(
            'confirm delete project',
        );
        await waitFor(() =>
            expect(confirmDeleteProjectButton).toBeInTheDocument(),
        );
        await user.click(confirmDeleteProjectButton);

        await waitFor(() => expect(selectedProject).not.toBeInTheDocument());
    });

    it.skip('should render toast notification on error', async () => {
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

describe.shuffle('ProjectTitle', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

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

    it('should render skeleton if project is still being fetched', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const result = renderWithClient(
            <ProjectTitle projectId={mockProjectId} />,
        );

        const skeletons = result.getByLabelText('loading');

        expect(skeletons).toBeInTheDocument();
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

        const titleInput = result.getByPlaceholderText(/new project name/i);
        expect(titleInput).toBeInTheDocument();
        expect(titleInput).toHaveFocus();
    });

    it('should render select dropdown to update project members', async () => {
        const user = userEvent.setup();

        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTitle = mockProjects()[0].title;
        const result = renderWithClient(
            <ProjectTitle projectId={mockProjectId} />,
        );
        await waitFor(() =>
            expect(result.getByText(mockProjectTitle)).toBeInTheDocument(),
        );

        const updateProjectMembersButton = result.getByTestId(
            'open-select-update-assigned',
        );

        await user.click(updateProjectMembersButton);

        const selectAssignedMembers = result.getByLabelText(
            'select project members',
        );

        expect(selectAssignedMembers).toBeInTheDocument();
        expect(selectAssignedMembers).toBeVisible();
    });

    it('should display all project members to the project which includes the project owner', async () => {
        const user = userEvent.setup();

        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTitle = mockProjects()[0].title;
        const mockProjectOwnerId = mockProjects()[0].ownerId;
        const mockProjectMemberIds = [
            mockProjects()[0].ownerId,
            ...mockProjects()[0].collaborators,
        ];
        const mockProjectMembers = mockUsers().filter((member) =>
            mockProjectMemberIds.includes(member._id),
        );

        const result = renderWithClient(
            <ProjectTitle projectId={mockProjectId} />,
        );
        await waitFor(() =>
            expect(result.getByText(mockProjectTitle)).toBeInTheDocument(),
        );

        const updateProjectMembersButton = result.getByTestId(
            'open-select-update-assigned',
        );

        await user.click(updateProjectMembersButton);

        mockProjectMembers.map((member) => {
            // Expect that all project members are selected options
            const valueOption = result.getByText(member.email);
            expect(valueOption).toBeInTheDocument();

            const valueRemoveOption = result.getByLabelText(
                `Remove ${member.email}`,
            );
            // Expect that all project owner cannot be removed from the list of selected options
            if (member._id === mockProjectOwnerId) {
                expect(valueRemoveOption).toHaveStyle('display: none');
            } else {
                expect(valueRemoveOption).not.toHaveStyle('display: none');
            }
        });
    });

    it('should be able to remove selected project members except for the project owner', async () => {
        const user = userEvent.setup();

        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTitle = mockProjects()[0].title;
        const mockProjectMemberIds = [
            mockProjects()[0].ownerId,
            ...mockProjects()[0].collaborators,
        ];
        const mockProjectMembers = mockUsers().filter((member) =>
            mockProjectMemberIds.includes(member._id),
        );

        const result = renderWithClient(
            <ProjectTitle projectId={mockProjectId} />,
        );
        await waitFor(() =>
            expect(result.getByText(mockProjectTitle)).toBeInTheDocument(),
        );

        const updateProjectMembersButton = result.getByTestId(
            'open-select-update-assigned',
        );

        await user.click(updateProjectMembersButton);

        // Select the 'remove' button of the first non-owner project member.
        const projectMemberToRemove = mockProjectMembers[1].email;
        const selectedMemberToRemoveButton = result.getByLabelText(
            `Remove ${projectMemberToRemove}`,
        );

        // Click the 'X' of the specific user option
        await user.click(selectedMemberToRemoveButton);

        mockProjectMembers.map((member) => {
            // Expect that the removed member is no longer listed in the selected options
            const valueOption = result.queryByText(member.email);
            if (member.email === projectMemberToRemove) {
                expect(valueOption).not.toBeInTheDocument();
            } else {
                expect(valueOption).toBeInTheDocument();
            }
        });

        // Select the 'clear' button of the Select menu
        const clearButton = result.getByLabelText('clear selected users');

        // Click the 'clear' button
        await user.click(clearButton);

        mockProjectMembers.map((member) => {
            // Expect that only the selected user option left is the project owner
            const projectOwnerEmail = mockUsers()[0].email;
            const valueOption = result.queryByText(member.email);
            if (member.email === projectOwnerEmail) {
                expect(valueOption).toBeInTheDocument();
            } else {
                expect(valueOption).not.toBeInTheDocument();
            }
        });
    });
});

describe.shuffle('CardView', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

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

    it('should render skeletons if project is still being fetched', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const result = renderWithClient(<CardView projectId={mockProjectId} />);

        const skeletons = result.getAllByLabelText('loading');

        expect(skeletons).toHaveLength(3);
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

describe.shuffle('TaskCardGroup', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('should be able to add new task via dropdown', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTaskState = mockProjects()[0].taskStates[0];

        const result = renderWithClient(
            <TaskCardGroup
                projectId={mockProjectId}
                taskState={mockProjectTaskState}
            />,
        );
        await waitFor(() => {
            expect(screen.getByText(mockProjectTaskState)).toBeInTheDocument();
        });
        const addTaskButton = result.getByTestId('add-task-button-dropdown');

        await user.click(addTaskButton);

        const titleInput = result.getByPlaceholderText(/enter new task name/i);
        expect(titleInput).toBeInTheDocument();
    });

    it('should be able to add new task via plus button', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTaskState = mockProjects()[0].taskStates[0];

        const result = renderWithClient(
            <TaskCardGroup
                projectId={mockProjectId}
                taskState={mockProjectTaskState}
            />,
        );
        await waitFor(() => {
            expect(screen.getByText(mockProjectTaskState)).toBeInTheDocument();
        });
        const addTaskButton = result.getByTestId('add-task-button-plus');

        await user.click(addTaskButton);

        const titleInput = result.getByPlaceholderText(/enter new task name/i);
        expect(titleInput).toBeInTheDocument();
    });

    it('should be able to delete a task', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockTaskId = mockProjects()[0].tasks[0]._id;
        const mockTaskTitle = mockProjects()[0].tasks[0].title;
        const mockProjectTaskState = mockProjects()[0].taskStates[0];

        const result = renderWithClient(
            <TaskCardGroup
                projectId={mockProjectId}
                taskState={mockProjectTaskState}
            />,
        );

        await waitFor(() => {
            expect(result.getByText(mockTaskTitle)).toBeInTheDocument();
        });
        const taskCardTitle = result.getByText(mockTaskTitle);
        await waitFor(() => {
            result.getByTestId(`open-task-modal-${mockTaskId}`);
        });
        const taskCardEditButton = result.getByTestId(
            `open-task-modal-${mockTaskId}`,
        );
        await user.click(taskCardEditButton);

        const deleteTaskButton = result.getByLabelText('delete task');
        await user.click(deleteTaskButton);

        const confirmDeleteTaskButton = result.getByLabelText(
            'confirm delete task',
        );
        await waitFor(() =>
            expect(confirmDeleteTaskButton).toBeInTheDocument(),
        );

        await user.click(confirmDeleteTaskButton);

        await waitFor(() => expect(taskCardTitle).not.toBeInTheDocument());
    });

    it('should render skeletons if tasks are still being fetched', async () => {
        const mockProjectId = mockProjects()[0]._id;
        const mockProjectTaskState = mockProjects()[0].taskStates[0];
        const result = renderWithClient(
            <TaskCardGroup
                projectId={mockProjectId}
                taskState={mockProjectTaskState}
            />,
        );

        const skeletons = result.getAllByLabelText('loading');

        expect(skeletons).toHaveLength(3);
    });
});

describe.shuffle('TaskCard', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

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

        await waitFor(() => {
            result.getByTestId(`open-task-modal-${mockTaskId}`);
        });
        const taskCardEditButton = result.getByTestId(
            `open-task-modal-${mockTaskId}`,
        );

        await user.click(taskCardEditButton);

        const taskModal = result.getByTestId(`task-modal-${mockTaskId}`);
        expect(taskModal).toBeInTheDocument();
        expect(taskModal).toHaveAttribute('role', 'dialog');
    });
});

describe.shuffle('TaskModal', () => {
    beforeEach(async () => {
        await setTestAccessTokenToLocalStorage();
    });

    afterEach(() => {
        clearTestAccessTokenFromLocalStorage();
    });

    it('should be able to edit the task title', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockTask = mockProjects()[0].tasks[0];
        const mockTaskId = mockTask._id;
        const result = renderWithClient(
            <TaskModal taskId={mockTaskId} projectId={mockProjectId} />,
        );
        await waitFor(() => {
            result.getByTestId(`open-task-modal-${mockTaskId}`);
        });
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

    it('should render dropdown to change task state', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockTask = mockProjects()[0].tasks[0];
        const mockTaskId = mockTask._id;
        const mockTaskState = mockTask.taskState;
        const result = renderWithClient(
            <TaskModal taskId={mockTaskId} projectId={mockProjectId} />,
        );
        await waitFor(() => {
            result.getByTestId(`open-task-modal-${mockTaskId}`);
        });
        const taskCardEditButton = result.getByTestId(
            `open-task-modal-${mockTaskId}`,
        );
        await user.click(taskCardEditButton);

        await waitFor(() =>
            expect(
                result.getByTestId(`task-modal-${mockTaskId}`),
            ).toBeInTheDocument(),
        );

        const editTaskStateButton = result.getByText(mockTaskState);
        await user.click(editTaskStateButton);

        expect(result.getByTestId('task-states-popover')).toBeVisible();
    });

    it('should render select dropdown to change update assigned task members', async () => {
        const user = userEvent.setup();
        const mockProjectId = mockProjects()[0]._id;
        const mockTask = mockProjects()[0].tasks[0];
        const mockTaskId = mockTask._id;
        const result = renderWithClient(
            <TaskModal taskId={mockTaskId} projectId={mockProjectId} />,
        );
        await waitFor(() => {
            result.getByTestId(`open-task-modal-${mockTaskId}`);
        });
        const taskCardEditButton = result.getByTestId(
            `open-task-modal-${mockTaskId}`,
        );
        await user.click(taskCardEditButton);

        await waitFor(() =>
            expect(
                result.getByTestId(`task-modal-${mockTaskId}`),
            ).toBeInTheDocument(),
        );

        const editAssignedMembersButton = result.getByTestId(
            'open-select-update-assigned',
        );

        await user.click(editAssignedMembersButton);

        const selectAssignedMembers = result.getByLabelText(
            'select project members',
        );

        expect(selectAssignedMembers).toBeInTheDocument();
        expect(selectAssignedMembers).toBeVisible();
    });
});
