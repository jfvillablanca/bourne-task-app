import { Check } from 'lucide-react';
import {
    ButtonHTMLAttributes,
    cloneElement,
    ReactElement,
    useState,
} from 'react';

import { Task } from '../api';
import { TaskCardProps } from '../common';

import { Popover, PopoverContent, PopoverTrigger } from './ui';

type ChildButton = ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;

const TaskAdd: React.FC<TaskCardProps & { children: ChildButton }> = ({
    children,
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
                {cloneElement(children, {
                    onClick: () => setOpen((v) => !v),
                })}
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

export default TaskAdd;
