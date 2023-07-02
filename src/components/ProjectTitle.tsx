import { Check, Pencil } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';

import { Project } from '../api';
import { ProjectDto } from '../common';
import { cn } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from './ui';

interface ProjectTitleProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}
const ProjectTitle: React.FC<
    HTMLAttributes<HTMLDivElement> & { projectId: string | null }
> = ({ className, projectId }) => {
    if (!projectId) {
        return (
            <h2
                className={cn('text-2xl font-medium tracking-tight', className)}
            >
                Select a project
            </h2>
        );
    } else {
        return (
            <ProjectTitleWrapped
                className={cn('text-2xl font-medium tracking-tight', className)}
                projectId={projectId}
            />
        );
    }
};

const ProjectTitleWrapped: React.FC<ProjectTitleProps> = ({
    className,
    projectId,
}) => {
    const [open, setOpen] = useState(false);
    const [projectMeta, setProjectMeta] = useState<ProjectDto>({
        title: '',
        description: '',
    });
    const [editProjectMeta, setEditProjectMeta] = useState(projectMeta);

    const projectQuery = Project.useFindOne(projectId);
    const projectMutation = Project.useUpdate(projectId);

    const handleMutation = () => {
        setProjectMeta(editProjectMeta);
        setOpen(false);
        projectMutation.mutate({
            title: editProjectMeta.title.trim(),
            description: editProjectMeta.description?.trim(),
        });
    };

    useEffect(() => {
        if (projectQuery.isSuccess) {
            setProjectMeta(() => projectQuery.data);
            setEditProjectMeta(() => projectQuery.data);
        }
    }, [projectQuery.isSuccess, projectQuery.data]);

    const handleFormInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        setEditProjectMeta((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (projectQuery.data) {
        return (
            <div className={cn('flex items-center gap-2 h-14', className)}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <div
                            className="btn btn-ghost flex gap-3 items-center data-[state=open]:bg-neutral"
                            data-testid={`project-title-${projectQuery.data._id}`}
                            onClick={() => setOpen((v) => !v)}
                        >
                            <h2 className="text-2xl font-medium tracking-tight normal-case">
                                {projectMeta.title}
                            </h2>
                            <Pencil className="w-4" />
                        </div>
                        {projectMeta.description && (
                            <h3 className="pl-4 flex justify-start text-sm">
                                {projectMeta.description}
                            </h3>
                        )}
                    </PopoverTrigger>
                    <PopoverContent className="min-w-[20rem]">
                        <form
                            className="form-control rounded-lg p-2 bg-neutral shadow-md shadow-accent/20"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleMutation();
                            }}
                        >
                            <label className="label" htmlFor="title">
                                <span className="label-text font-semibold">
                                    Title:
                                </span>
                            </label>
                            <input
                                className="input input-accent w-full"
                                placeholder="New project name"
                                required
                                name="title"
                                value={editProjectMeta.title}
                                onChange={handleFormInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleMutation();
                                    }
                                }}
                                autoFocus={true}
                            />
                            <label className="label" htmlFor="description">
                                <span className="label-text font-semibold">
                                    Summary:
                                </span>
                            </label>
                            <textarea
                                className="textarea textarea-accent h-full w-full resize-none mb-4"
                                placeholder="Optional: Give a short summary of the project"
                                name="description"
                                value={editProjectMeta.description}
                                onChange={handleFormInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleMutation();
                                    }
                                }}
                            />
                            <button
                                className="self-end btn btn-sm btn-ghost hover:btn-accent flex"
                                type="submit"
                            >
                                <Check className="w-4" />
                                Submit
                            </button>
                        </form>
                    </PopoverContent>
                </Popover>
            </div>
        );
    }

    return <Skeleton className={cn('h-11 max-w-md', className)} />;
};

export default ProjectTitle;
