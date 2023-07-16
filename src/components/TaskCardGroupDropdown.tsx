import { Check, MoreVertical } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

import { Task } from '../api';
import { cn } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './ui';

interface TaskCardDropdownProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
    taskState: string;
}

const TaskCardGroupDropdown: React.FC<TaskCardDropdownProps> = ({
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
                    <AddTaskButton
                        className="join-item"
                        taskState={taskState}
                        projectId={projectId}
                    />
                </li>
            </ul>
        </div>
    );
};

const AddTaskButton: React.FC<TaskCardDropdownProps> = ({
    className,
    taskState,
    projectId,
}) => {
    const [open, setOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('New task');

    const taskMutation = Task.useCreate(projectId);

    const handleMutation = () => {
        setOpen(false);
        taskMutation.mutate({ title: newTaskTitle.trim(), taskState });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'btn p-4 w-max border border-base-content rounded-lg backdrop-filter backdrop-blur-lg',
                        className,
                    )}
                    data-testid={`add-task-button`}
                    onClick={() => setOpen((v) => !v)}
                >
                    Add new task
                </button>
            </PopoverTrigger>
            <PopoverContent>
                <form
                    className="flex gap-3 w-full max-w-sm items-center rounded-lg p-2 bg-neutral shadow-md shadow-accent/20"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleMutation();
                    }}
                >
                    <input
                        className="input input-bordered input-accent w-full"
                        placeholder="Enter new task name"
                        required
                        value={newTaskTitle}
                        onChange={(e) => {
                            setNewTaskTitle(() => e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleMutation();
                            }
                        }}
                        autoFocus={true}
                    />
                    <button
                        className="btn btn-sm btn-circle btn-ghost hover:btn-accent"
                        type="submit"
                    >
                        <Check className="w-4" />
                    </button>
                </form>
            </PopoverContent>
        </Popover>
    );
};

export default TaskCardGroupDropdown;
