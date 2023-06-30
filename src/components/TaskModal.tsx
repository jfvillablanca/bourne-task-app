import { Check, Pencil } from 'lucide-react';
import React, { HTMLAttributes, useEffect, useState } from 'react';

import { Project, Task } from '../api';
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

type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface TaskModalProps extends HTMLAttributes<HTMLDivElement> {
    taskId: string;
    projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({
    className,
    taskId,
    projectId,
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [taskForm, setTaskForm] = useState<UpdateTaskDto>({
        title: '',
        description: '',
        taskState: '',
    });
    const [editTaskForm, setEditTaskForm] = useState<UpdateTaskDto>(taskForm);

    const taskQuery = Task.useFindOne(projectId, taskId);
    const taskMutation = Task.useUpdate(projectId, taskId);
    const projQueryTaskStates = Project.useGetTaskStates(projectId);

    useEffect(() => {
        if (taskQuery.isSuccess) {
            setTaskForm(() => ({
                title: taskQuery.data.title,
                description: taskQuery.data.description,
                taskState: taskQuery.data.taskState,
            }));
            setEditTaskForm(() => ({
                title: taskQuery.data.title,
                description: taskQuery.data.description,
                taskState: taskQuery.data.taskState,
            }));
        }
    }, [taskQuery.isSuccess, taskQuery.data]);

    const handleChange = (e: React.ChangeEvent<FormElement>) => {
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
                    data-testid={`open-task-modal-${taskId}`}
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
                            <FormTaskTitle
                                title={editTaskForm.title ?? ''}
                                handleChange={handleChange}
                            />
                        </div>
                        <ExitButton className="ml-2">
                            <DialogClose />
                        </ExitButton>
                    </div>
                    <div className="flex flex-col gap-2 flex-1 mt-1">
                        <FormTaskState
                            currentTaskState={editTaskForm.taskState ?? ''}
                            taskStates={projQueryTaskStates.data ?? []}
                            handleChange={handleChange}
                        />
                        <FormTaskDescription
                            description={editTaskForm.description ?? ''}
                            handleChange={handleChange}
                        />
                        <FormTaskMembers
                            projectId={projectId}
                            members={taskQuery.data?.assignedProjMemberId ?? []}
                        />
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

const FormTaskTitle = ({
    title,
    handleChange,
}: {
    title: string;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
}) => {
    return (
        <>
            <label htmlFor="title">
                <span className="label-text font-semibold">Task:</span>
            </label>
            <input
                className="input focus:input-accent text-xl w-full resize-none"
                id="title"
                name="title"
                placeholder="What are we working on?"
                required
                value={title}
                onChange={handleChange}
            />
        </>
    );
};

const FormTaskState = ({
    currentTaskState,
    taskStates,
    handleChange,
}: {
    currentTaskState: string;
    taskStates: string[];
    handleChange: (e: React.ChangeEvent<FormElement>) => void;
}) => {
    return (
        <div className="dropdown dropdown-right w-min">
            <button
                className="btn btn-ghost border border-base-content p-2 mr-2"
                data-testid="open-select-task-state"
                onClick={(e) => e.preventDefault()}
            >
                {currentTaskState}
            </button>
            <select
                className="select select-accent dropdown-content z-[1] p-2 text-lg capitalize"
                tabIndex={0}
                name="taskState"
                value={currentTaskState}
                onChange={handleChange}
            >
                {taskStates.map((taskState, i) => {
                    return (
                        <option
                            key={i}
                            className="join-item"
                            value={taskState}
                            disabled={currentTaskState === taskState}
                        >
                            {taskState}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

const FormTaskDescription = ({
    description,
    handleChange,
}: {
    description: string;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
}) => {
    return (
        <>
            <label htmlFor="description">
                <span className="label-text font-semibold">Summary:</span>
            </label>
            <textarea
                className="textarea textarea-md border-base-content focus:textarea-accent mt-1 resize-none"
                id="description"
                name="description"
                placeholder="Give a quick summary of the task"
                value={description}
                onChange={handleChange}
            />
        </>
    );
};

const FormTaskMembers = ({
    projectId,
    members,
}: {
    projectId: string;
    members: string[];
}) => {
    return (
        <>
            <div className="label-text font-semibold">Assigned:</div>
            <MemberAvatars
                className="h-11 w-full"
                projectId={projectId}
                taskMemberIds={members}
            />
        </>
    );
};

export default TaskModal;
