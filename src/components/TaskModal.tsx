import { Check } from 'lucide-react';
import React, {
    HTMLAttributes,
    ReactElement,
    useEffect,
    useState,
} from 'react';

import { Task } from '../api';
import { UpdateTaskDto } from '../common';
import { cn } from '../lib/utils';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
    ExitButton,
} from './ui';
import { MemberAvatars } from '.';

interface TaskModalProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactElement;
    taskId: string;
    projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
    className,
    children,
    taskId,
    projectId,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [taskForm, setTaskForm] = useState<UpdateTaskDto>({
        title: '',
        description: '',
    });
    const [editTaskForm, setEditTaskForm] = useState<UpdateTaskDto>(taskForm);

    const taskQuery = Task.useFindOne(projectId, taskId);
    const taskMutation = Task.useUpdate(projectId, taskId);

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

    const button = React.cloneElement(children, {
        'data-testid': `open-task-modal-${taskId}`,
        onClick: () => setOpen((v) => !v),
    });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{button}</DialogTrigger>
            <DialogContent
                className={cn(
                    'h-1/2 w-1/3 p-5 bg-base-100 border rounded-lg',
                    className,
                )}
                data-testid={`task-modal-${taskId}`}
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
                                placeholder="What are we working on?"
                                required
                                value={editTaskForm.title}
                                onChange={handleChange}
                            />
                        </div>
                        <ExitButton className="ml-2">
                            <DialogClose />
                        </ExitButton>
                    </div>
                    <div className="flex flex-col gap-2 flex-1 mt-1">
                        <label htmlFor="description">
                            <span className="label-text font-semibold">
                                Summary:
                            </span>
                        </label>
                        <textarea
                            className="textarea textarea-md border-base-content focus:textarea-accent mt-1 resize-none"
                            id="description"
                            name="description"
                            placeholder="Give a quick summary of the task"
                            value={editTaskForm.description}
                            onChange={handleChange}
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
                                taskMemberIds={
                                    taskQuery.data?.assignedProjMemberId
                                }
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
