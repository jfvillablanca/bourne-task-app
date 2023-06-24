import { Pencil } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { TaskDocument } from '../common';
import { cn } from '../lib/utils';

import { MemberAvatars, TaskModal } from '.';

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
    return (
        <div
            className={cn('p-2 rounded-lg border', className)}
            data-testid={`task-card-${task._id}`}
            {...props}
        >
            <div className="flex justify-between">
                <h3 className="text-sm font-semibold flex-1 self-center">
                    {task.title}
                </h3>
                <button
                    className="btn btn-sm btn-circle btn-ghost ml-3 self-start"
                    onClick={() => window[task._id].showModal()}
                >
                    <Pencil className="w-4" />
                </button>
                <TaskModal task={task} projectId={projectId} />
            </div>
            {task.description && <div className="divider mt-0 mb-2"></div>}
            <div className="">
                <p>{task.description}</p>
            </div>
            <MemberAvatars
                projectId={projectId}
                taskMemberIds={task.assignedProjMemberId}
            />
        </div>
    );
};

export default TaskCard;
