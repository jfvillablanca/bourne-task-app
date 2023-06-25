import { Check, Pencil } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';

import { Project } from '../api';
import { cn } from '../lib/utils';

import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from './ui';

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
    const [title, setTitle] = useState('');
    const [editTitle, setEditTitle] = useState(title);

    const projectQuery = Project.useFindOne(projectId);
    const projectMutation = Project.useUpdate(projectId);

    const handleMutation = () => {
        setTitle(editTitle);
        setOpen(false);
        projectMutation.mutate({ title: editTitle.trim() });
    };

    useEffect(() => {
        if (projectQuery.isSuccess) {
            setTitle(() => projectQuery.data.title);
            setEditTitle(() => projectQuery.data.title);
        }
    }, [projectQuery.isSuccess, projectQuery.data]);

    if (projectQuery.data) {
        return (
            <div className={cn('flex items-center gap-2 h-14', className)}>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className="btn btn-ghost flex gap-3 items-center data-[state=open]:bg-neutral"
                            data-testid={`project-title-${projectQuery.data._id}`}
                            onClick={() => setOpen((v) => !v)}
                        >
                            <h2 className="text-2xl font-medium tracking-tight normal-case">
                                {title}
                            </h2>
                            <Pencil className="w-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="flex gap-3 items-center rounded-lg p-2 bg-neutral shadow-md shadow-accent/20">
                        <input
                            className="input input-bordered input-accent w-full max-w-xs"
                            value={editTitle}
                            onChange={(e) => {
                                setEditTitle(() => e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleMutation();
                                }
                            }}
                            data-testid={`project-input-edit-title-${projectQuery.data._id}`}
                            autoFocus={true}
                        />
                        <PopoverClose
                            className="btn btn-sm btn-circle btn-ghost hover:btn-accent"
                            onClick={handleMutation}
                        >
                            <Check className="w-4" />
                        </PopoverClose>
                    </PopoverContent>
                </Popover>
            </div>
        );
    }

    return <h2>Loading...</h2>;
};

export default ProjectTitle;
