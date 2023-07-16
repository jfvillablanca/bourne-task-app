import { Check, Pencil } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';
import { useBoolean } from 'usehooks-ts';

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
import { FormTaskMembers, MemberAvatars, TaskDelete } from '.';

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
    const {
        value: isOpen,
        setValue: setIsOpen,
        setFalse: closeModal,
        toggle: toggleOpen,
    } = useBoolean(false);
    const { value: isFindOneQueryEnabled, setFalse: disableFindOneQuery } =
        useBoolean(true);
    const [taskForm, setTaskForm] = useState<UpdateTaskDto>({
        title: '',
        description: '',
        taskState: '',
        assignedProjMemberId: [],
    });
    const [editTaskForm, setEditTaskForm] = useState<UpdateTaskDto>(taskForm);

    const taskQuery = Task.useFindOne(projectId, taskId, isFindOneQueryEnabled);
    const taskMutation = Task.useUpdate(projectId, taskId);
    const projQueryTaskStates = Project.useGetTaskStates(projectId);
    const projQueryMembers = Project.useGetProjectMembers(projectId);

    useEffect(() => {
        if (taskQuery.isSuccess) {
            const { title, description, taskState, assignedProjMemberId } =
                taskQuery.data;
            setTaskForm(() => ({
                title,
                description,
                taskState,
                assignedProjMemberId,
            }));
            setEditTaskForm(() => ({
                title,
                description,
                taskState,
                assignedProjMemberId,
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
        closeModal();
        taskMutation.mutate(editTaskForm);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className="btn btn-sm btn-circle btn-ghost ml-3 self-start"
                    data-testid={`open-task-modal-${taskId}`}
                    onClick={() => toggleOpen()}
                >
                    <Pencil className="w-4" />
                </button>
            </DialogTrigger>
            <DialogContent
                className={cn('h-1/2 w-1/3 p-5 bg-base-200', className)}
                overlayClassName="bg-base-100/50"
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
                    <div className="flex justify-between">
                        <TaskDelete
                            className="p-2"
                            projectId={projectId}
                            taskId={taskId}
                            cleanup={() => {
                                disableFindOneQuery();
                                closeModal();
                            }}
                        />
                        <button
                            className="btn btn-outline hover:btn-accent self-end"
                            type="submit"
                        >
                            <Check />
                            Submit
                        </button>
                    </div>
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
