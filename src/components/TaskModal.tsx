import { Check, Pencil, X } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';

import { Task } from '../api';
import { TaskDocument, UpdateTaskDto } from '../common';
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
    const [taskForm, setTaskForm] = useState<UpdateTaskDto>({
        title: '',
        description: '',
    });
    const [editTaskForm, setEditTaskForm] = useState<UpdateTaskDto>(taskForm);

    const taskQuery = Task.useFindOne(projectId, task._id);
    const taskMutation = Task.useUpdate(projectId, task._id);

    useEffect(() => {
        if (taskQuery.isSuccess) {
            setTaskForm(() => ({
                title: taskQuery.data.title,
                description: taskQuery.data.description,
            }));
            setEditTaskForm(() => ({
                title: taskQuery.data.title,
                description: taskQuery.data.description,
            }));
        }
    }, [taskQuery.isSuccess, taskQuery.data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditTaskForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMutation = () => {
        setTaskForm(() => editTaskForm);
        setOpen(false);
        taskMutation.mutate(editTaskForm);
    };

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
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleMutation();
                    }}
                >
                    <div className="flex justify-between">
                        <DialogHeading className="font-semibold text-lg">
                            <label htmlFor="title">Title: </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={editTaskForm.title}
                                onChange={handleChange}
                                data-testid={`task-edit-title-${task._id}`}
                            />
                        </DialogHeading>
                        <DialogClose className="btn btn-sm btn-circle btn-ghost">
                            <X className="text-sm" />
                        </DialogClose>
                    </div>
                    {task.description && (
                        <div className="divider mt-0 mb-2"></div>
                    )}
                    <DialogDescription className="">
                        <label htmlFor="Description">Description: </label>
                        <input
                            type="text"
                            id="description"
                            name="description"
                            value={editTaskForm.description}
                            onChange={handleChange}
                            data-testid={`task-edit-description-${task._id}`}
                        />
                    </DialogDescription>
                    <MemberAvatars
                        className="w-8 h-8"
                        projectId={projectId}
                        taskMemberIds={task.assignedProjMemberId}
                    />
                    <button type="submit">
                        <Check />
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;
