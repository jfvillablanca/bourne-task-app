import { Pencil, X } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

import { TaskDocument } from '../common';
import { cn } from '../lib/utils';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeading,
    DialogTrigger,
} from './ui';
import { MemberAvatars } from '.';

interface TaskModalProps extends HTMLAttributes<HTMLDivElement> {
    task: TaskDocument;
    projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
    className,
    task,
    projectId,
    ...props
}) => {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="btn btn-sm btn-circle btn-ghost ml-3 self-start"
                    data-testid={`open-task-modal-${task._id}`}
                    onClick={() => setOpen((v) => !v)}
                >
                    <Pencil className="w-4" />
                </button>
            </DialogTrigger>
            <DialogContent
                className={cn(
                    'h-max p-5 w-max bg-neutral rounded-lg',
                    className,
                )}
                data-testid={`task-modal-${task._id}`}
                {...props}
            >
                <div className="flex justify-between">
                    <DialogHeading className="font-semibold text-lg">
                        {task.title}
                    </DialogHeading>
                    <DialogClose className="btn btn-sm btn-circle btn-ghost">
                        <X className="text-sm" />
                    </DialogClose>
                </div>
                {task.description && <div className="divider mt-0 mb-2"></div>}
                <DialogDescription className="">
                    <p>{task.description}</p>
                </DialogDescription>
                <MemberAvatars
                    className="w-8 h-8"
                    projectId={projectId}
                    taskMemberIds={task.assignedProjMemberId}
                />
            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;
