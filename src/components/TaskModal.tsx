import { Check, Pencil } from 'lucide-react';
import React, { HTMLAttributes, useEffect, useState } from 'react';

import { Project, Task } from '../api';
import {
    FormChangeType,
    FormElementType,
    SubTask,
    UpdateTaskDto,
} from '../common';
import { cn } from '../lib/utils';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
    ExitButton,
} from './ui';
import { FormTaskMembers, MemberAvatars } from '.';

interface FormElementProps extends HTMLAttributes<FormElementType> {
    label: string;
    id: string;
    name: string;
    placeholder: string;
    required?: boolean;
    value: string;
    handleChange: (e: FormChangeType) => void;
    FormComponent: React.ElementType;
}

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
        assignedProjMemberId: [],
    });
    const [editTaskForm, setEditTaskForm] = useState<UpdateTaskDto>(taskForm);

    const taskQuery = Task.useFindOne(projectId, taskId);
    const taskMutation = Task.useUpdate(projectId, taskId);
    const projQueryTaskStates = Project.useGetTaskStates(projectId);
    const projQueryMembers = Project.useGetProjectMembers(projectId);

    useEffect(() => {
        if (taskQuery.isSuccess) {
            setTaskForm(() => ({
                title: taskQuery.data.title,
                description: taskQuery.data.description,
                taskState: taskQuery.data.taskState,
                assignedProjMemberId: taskQuery.data.assignedProjMemberId,
            }));
            setEditTaskForm(() => ({
                title: taskQuery.data.title,
                description: taskQuery.data.description,
                taskState: taskQuery.data.taskState,
                assignedProjMemberId: taskQuery.data.assignedProjMemberId,
            }));
        }
    }, [taskQuery.isSuccess, taskQuery.data]);

    const handleChange = (e: FormChangeType) => {
        let name: string, value: string | string[] | SubTask[];

        if ('target' in e) {
            name = e.target.name;
            value = e.target.value;
        } else {
            name = e.name;
            value = e.value;
        }
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
                        <div className="flex flex-col gap-1 flex-1 mb-2">
                            <FormElement
                                label="Task:"
                                className="input focus:input-accent text-xl w-full resize-none"
                                id="title"
                                name="title"
                                placeholder="What are we working on?"
                                required={true}
                                value={editTaskForm.title ?? ''}
                                handleChange={handleChange}
                                FormComponent="input"
                            />
                        </div>
                        <DialogClose className="flex ml-2 h-min">
                            <ExitButton />
                        </DialogClose>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <FormTaskState
                            taskStates={projQueryTaskStates.data ?? []}
                            value={editTaskForm.taskState ?? ''}
                            handleChange={handleChange}
                        />
                        <FormElement
                            label="Summary:"
                            className="textarea textarea-md border-base-content focus:textarea-accent mt-1 resize-none"
                            id="description"
                            name="description"
                            placeholder="Give a quick summary of the task"
                            value={editTaskForm.description ?? ''}
                            handleChange={handleChange}
                            FormComponent="textarea"
                        />
                        <div className="label-text font-semibold">
                            Assigned:
                        </div>
                        <div className="flex items-center">
                            <MemberAvatars
                                className="h-11 w-max mr-1"
                                projectId={projectId}
                                taskMemberIds={
                                    editTaskForm.assignedProjMemberId ?? []
                                }
                            />
                            <FormTaskMembers
                                projectMembers={projQueryMembers.data ?? []}
                                value={editTaskForm.assignedProjMemberId ?? []}
                                handleChange={handleChange}
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

const FormElement = ({
    label,
    className,
    id,
    name,
    placeholder,
    required = false,
    value,
    handleChange,
    FormComponent,
}: FormElementProps) => {
    return (
        <>
            <label htmlFor={id}>
                <span className="label-text font-semibold">{label}</span>
            </label>
            <FormComponent
                className={className}
                id={id}
                name={name}
                placeholder={placeholder}
                required={required}
                value={value}
                onChange={handleChange}
            />
        </>
    );
};

const FormTaskState = ({
    value,
    taskStates,
    handleChange,
}: {
    value: string;
    taskStates: string[];
    handleChange: (e: FormChangeType) => void;
}) => {
    return (
        <div className="dropdown dropdown-right w-min">
            <button
                className="btn btn-ghost border border-base-content p-2 mr-2"
                data-testid="open-select-task-state"
                onClick={(e) => e.preventDefault()}
            >
                {value}
            </button>
            <select
                className="select select-accent dropdown-content z-[1] p-2 text-lg capitalize"
                tabIndex={0}
                name="taskState"
                data-testid="select-task-state-combobox"
                value={value}
                onChange={handleChange}
            >
                {taskStates.map((taskState, i) => {
                    return (
                        <option
                            key={i}
                            className="join-item"
                            value={taskState}
                            disabled={value === taskState}
                        >
                            {taskState}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default TaskModal;
