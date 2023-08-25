import { MoreVertical } from 'lucide-react';

import { TaskCardProps } from '../common';

import { TaskAdd } from '.';

const TaskCardGroupDropdown: React.FC<TaskCardProps> = ({
    taskState,
    projectId,
}) => {
    return (
        <div className="dropdown dropdown-left">
            <label
                className="btn btn-sm btn-circle btn-ghost ml-3 self-start"
                tabIndex={0}
            >
                <MoreVertical strokeWidth={3} className="w-5" />
            </label>
            <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu join join-vertical"
            >
                <li>
                    <TaskAdd taskState={taskState} projectId={projectId}>
                        <button
                            className="join-item btn p-4 w-max border border-base-content rounded-lg backdrop-filter backdrop-blur-lg"
                            data-testid="add-task-button-dropdown"
                        >
                            Add new task
                        </button>
                    </TaskAdd>
                </li>
            </ul>
        </div>
    );
};

export default TaskCardGroupDropdown;
