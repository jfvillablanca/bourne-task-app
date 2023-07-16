import { HTMLAttributes } from 'react';
import { useToggle } from 'usehooks-ts';

import { Project } from '../api';
import { FormChangeType, UpdateTaskDto } from '../common';
import { cn } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './ui';

interface FormTaskStatePopoverProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
    value: string;
    handleChange: (e: FormChangeType) => void;
}

const FormTaskStatePopover: React.FC<FormTaskStatePopoverProps> = ({
    className,
    projectId,
    value: currentTaskState,
    handleChange,
    ...props
}) => {
    const [open, toggleOpen, setOpen] = useToggle();

    const taskStatesQuery = Project.useGetTaskStates(projectId);
    const taskStates = taskStatesQuery.data ?? [];

    const handleSelectTaskState = (
        newTaskState: NonNullable<UpdateTaskDto['taskState']>,
    ) => {
        setOpen(false);
        handleChange({ name: 'taskState', value: newTaskState });
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className="btn btn-ghost border border-base-content p-2 mr-2 w-min"
                    type="button"
                    onClick={toggleOpen}
                >
                    {currentTaskState}
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'border backdrop-filter backdrop-blur-xl',
                    className,
                )}
                {...props}
            >
                <ul
                    className="menu bg-base-200"
                    data-testid="task-states-popover"
                >
                    {taskStates.map((taskState, i) => {
                        return (
                            <li key={i} className="join-item">
                                <button
                                    className={`${
                                        currentTaskState === taskState
                                            ? 'btn-disabled text-neutral-focus'
                                            : 'btn-ghost'
                                    }`}
                                    disabled={currentTaskState === taskState}
                                    onClick={() =>
                                        handleSelectTaskState(taskState)
                                    }
                                >
                                    {taskState}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </PopoverContent>
        </Popover>
    );
};

export default FormTaskStatePopover;
