import { Check, Plus } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

import { Project } from '../api';
import { ProjectDto } from '../common';
import { cn } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './ui';

const ProjectAdd: React.FC<HTMLAttributes<HTMLButtonElement>> = ({
    className,
}) => {
    const [open, setOpen] = useState(false);
    const [taskForm, setTaskForm] = useState<ProjectDto>({
        title: '',
        description: '',
    });
    const [editTaskForm, setEditTaskForm] = useState<ProjectDto>(taskForm);

    const projectMutation = Project.useCreate();

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
        projectMutation.mutate(editTaskForm);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    className={cn(
                        'btn btn-outline border-1 btn-neutral h-min',
                        className,
                    )}
                    data-testid="add-new-project"
                    onClick={() => {
                        setOpen((v) => !v);
                    }}
                >
                    <Plus strokeWidth={3} />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-xs items-center border p-4 backdrop-filter backdrop-blur-xl">
                <form
                    className="form-control gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleMutation();
                    }}
                >
                    <label htmlFor="title">
                        <span className="label-text font-semibold">Title:</span>
                    </label>
                    <input
                        className="input focus:input-accent text-lg w-full resize-none"
                        id="title"
                        name="title"
                        placeholder="New project name"
                        required
                        value={editTaskForm.title}
                        onChange={handleChange}
                    />
                    <label htmlFor="description">
                        <span className="label-text font-semibold">
                            Summary:
                        </span>
                    </label>
                    <textarea
                        className="textarea textarea-md border-base-content focus:textarea-accent mt-1 resize-none"
                        id="description"
                        name="description"
                        placeholder="Optional: Give a short summary of the project"
                        value={editTaskForm.description}
                        onChange={handleChange}
                    />
                    <button
                        className="btn btn-ghost hover:btn-accent self-end"
                        type="submit"
                    >
                        <Check />
                        Submit
                    </button>
                </form>
            </PopoverContent>
        </Popover>
    );
};

export default ProjectAdd;
