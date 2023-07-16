import { Trash } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { Task } from '../api';
import { cn } from '../lib/utils';

import { DeleteConfirmModal } from './ui';

interface TaskDeleteProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
    taskId: string;
    cleanup: () => void;
}

const TaskDelete = ({
    className,
    projectId,
    taskId,
    cleanup,
    ...props
}: TaskDeleteProps) => {
    const taskMutation = Task.useRemove(projectId, taskId);

    const handleConfirmDeleteTask = () => {
        cleanup();
        taskMutation.mutate();
    };

    return (
        <DeleteConfirmModal
            renderButton={() => (
                <div
                    className={cn('btn btn-outline btn-error', className)}
                    role="button"
                    aria-label="delete task"
                    {...props}
                >
                    <Trash className="w-4 place-self-center" />
                    Delete
                </div>
            )}
            renderWarningModal={() => (
                <div className="form-control gap-2">
                    <h3 className="font-bold text-lg">
                        Are you sure you want to delete?
                    </h3>
                    <button
                        className="btn btn-outline btn-error"
                        aria-label="confirm delete task"
                        onClick={() => handleConfirmDeleteTask()}
                    >
                        Confirm
                    </button>
                </div>
            )}
        />
    );
};

export default TaskDelete;
