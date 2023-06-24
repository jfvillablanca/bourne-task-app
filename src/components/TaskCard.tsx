import { Edit } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { TaskDocument } from '../common';
import { cn } from '../lib/utils';

import { MemberAvatars } from '.';

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
                <h3 className="text-sm font-semibold flex-1">{task.title}</h3>
                <Edit className="w-4 ml-3 self-start text-neutral-500" />
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
