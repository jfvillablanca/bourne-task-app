import { X } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { TaskDocument } from '../common';
import { cn } from '../lib/utils';

import { MemberAvatars } from '.';

interface TaskModalProps extends HTMLAttributes<HTMLDivElement> {
    task: TaskDocument;
    projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
    className,
    task,
    projectId,
}) => {
    return (
        <dialog
            id={task._id}
            className={cn('modal modal-bottom sm:modal-middle', className)}
            data-testid={`task-modal-${task._id}`}
        >
            <form method="dialog" className="modal-box">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                    <X className="text-sm" />
                </button>
                <h3 className="">{task.title}</h3>
                {task.description && <div className="divider mt-0 mb-2"></div>}
                <div className="">
                    <p>{task.description}</p>
                </div>
                <MemberAvatars
                    projectId={projectId}
                    taskMemberIds={task.assignedProjMemberId}
                />
            </form>
        </dialog>
    );
};

export default TaskModal;
