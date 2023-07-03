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
            className={cn(
                'flex flex-col gap-2 p-4 rounded-lg bg-base-200',
                className,
            )}
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
            {task.subtasks && (
                <ul>
                    {task.subtasks.map((subtask, i) => {
                        return (
                            <li
                                key={`${task._id}-${i}`}
                                className="flex gap-2 items-center"
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-xs cursor-default border-base-content"
                                    checked={subtask.isCompleted}
                                    readOnly
                                />
                                <p>{subtask.title}</p>
                            </li>
                        );
                    })}
                </ul>
            )}
            <MemberAvatars
                projectId={projectId}
                taskMemberIds={task.assignedProjMemberId}
            />
        </div>
    );
};

export default TaskCard;
