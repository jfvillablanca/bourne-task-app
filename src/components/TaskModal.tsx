import { Check, Pencil, X } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';

import { Task } from '../api';
import { TaskDocument, UpdateTaskDto } from '../common';
import { cn } from '../lib/utils';

import { Dialog, DialogClose, DialogContent, DialogTrigger } from './ui';
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
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
                    'h-1/2 w-1/3 p-5 bg-base-100 border rounded-lg',
                    className,
                )}
                data-testid={`task-modal-${task._id}`}
                {...props}
            >
                <form
                    className="form-control h-full"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleMutation();
                    }}
                >
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-1 flex-1">
                            <label htmlFor="title">
                                <span className="label-text font-semibold">
                                    Task:
                                </span>
                            </label>
                            <input
                                className="input focus:input-accent text-xl w-full resize-none"
                                id="title"
                                name="title"
                                value={editTaskForm.title}
                                onChange={handleChange}
                                data-testid={`task-edit-title-${task._id}`}
                            />
                        </div>
                        <DialogClose className="btn btn-sm btn-circle btn-ghost ml-2">
                            <X className="text-sm" />
                        </DialogClose>
                    </div>
                    {task.description && (
                        <div className="divider mt-0 mb-2"></div>
                    )}
                    <div className="flex flex-col gap-2 flex-1">
                        <label htmlFor="description">
                            <span className="label-text font-semibold">
                                Summary:
                            </span>
                        </label>
                        <textarea
                            className="textarea textarea-md border-base-content focus:textarea-accent mt-1 resize-none"
                            id="description"
                            name="description"
                            value={editTaskForm.description}
                            onChange={handleChange}
                            data-testid={`task-edit-description-${task._id}`}
                        />
                        <div>
                            <label htmlFor="description">
                                <span className="label-text font-semibold">
                                    Assigned:
                                </span>
                            </label>
                            <MemberAvatars
                                className="h-11 w-full"
                                projectId={projectId}
                                taskMemberIds={task.assignedProjMemberId}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-ghost hover:btn-accent self-end"
                        type="submit"
                    >
                        <Check />
                        Submit
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;
