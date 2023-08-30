import { HTMLAttributes } from 'react';

import { Project } from '../api';
import { TaskDocument } from '../common';
import { cn } from '../lib/utils';

import { TaskModal, UserAvatars } from '.';

interface TaskCardProps extends HTMLAttributes<HTMLDivElement> {
    task: TaskDocument;
    projectId: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
    className,
    task,
    projectId,
    ...props
}) => {
    const projQueryMembers = Project.useGetProjectMembers(projectId);
    const assignedToTask =
        projQueryMembers.data?.filter((projectMember) =>
            task.assignedProjMemberId?.includes(projectMember._id),
        ) ?? [];

    return (
        <div
            className={cn('flex flex-col gap-2 p-4 bg-base-200', className)}
            data-testid={`task-card-${task._id}`}
            {...props}
        >
            <div className="flex justify-between">
                <h3 className="text-xl font-semibold flex-1 self-center">
                    {task.title}
                </h3>
                <TaskModal taskId={task._id} projectId={projectId} />
            </div>
            {task.description && <div className="divider mt-0 mb-0"></div>}
            <div className="">
                <p>{task.description}</p>
            </div>
            {task.description && <div className="divider mt-0 mb-0"></div>}
            {projQueryMembers.isLoading ? (
                <div className={cn('', className)} {...props}>
                    <div
                        aria-disabled
                        aria-label="loading"
                        className="loading loading-spinner loading-lg"
                    ></div>
                </div>
            ) : (
                <UserAvatars users={assignedToTask} />
            )}
        </div>
    );
};

export default TaskCard;
