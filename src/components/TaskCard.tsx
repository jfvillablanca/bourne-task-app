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
        <div className={cn('p-2 rounded-lg border', className)} {...props}>
            <h3 className="text-sm font-semibold">{task.title}</h3>
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
