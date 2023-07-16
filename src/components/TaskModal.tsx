import { Check, Pencil } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';
import { useBoolean } from 'usehooks-ts';

import { Project, Task } from '../api';
import { FormChangeType, FormElementType, UpdateTaskDto } from '../common';
import { cn } from '../lib/utils';

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTrigger,
    ExitButton,
} from './ui';
import {
    FormTaskMembers,
    FormTaskStatePopover,
    MemberAvatars,
    TaskDelete,
} from '.';

interface FormElementProps extends HTMLAttributes<FormElementType> {
    label: string;
    id: string;
    name: keyof UpdateTaskDto;
    placeholder: string;
    required?: boolean;
    value: UpdateTaskDto[keyof UpdateTaskDto];
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
        const [name, value] =
            'target' in e
                ? [
                      e.target.name as keyof UpdateTaskDto,
                      e.target.value as UpdateTaskDto[keyof UpdateTaskDto],
                  ]
                : [e.name, e.value];

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
                        <FormTaskStatePopover
                            projectId={projectId}
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

export default TaskModal;
