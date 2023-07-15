import { Trash } from 'lucide-react';
import { HTMLAttributes, useContext } from 'react';

import { Project } from '../api';
import { SelectedProjectContext } from '../context';
import { cn } from '../lib/utils';

import { DeleteConfirmModal } from './ui';

interface ProjectDeleteProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}

const ProjectDelete = ({
    className,
    projectId,
    ...props
}: ProjectDeleteProps) => {
    const projectMutation = Project.useRemove(projectId);
    const { setSelectedProject } = useContext(SelectedProjectContext);

    const handleConfirmDeleteProject = () => {
        projectMutation.mutate();
        setSelectedProject(null);
    };

    return (
        <DeleteConfirmModal
            renderButton={() => (
                <div
                    className={cn(
                        'btn btn-ghost hover:btn-error grid',
                        className,
                    )}
                    role="button"
                    aria-label="delete project"
                    {...props}
                >
                    <Trash className="w-4 place-self-center" />
                </div>
            )}
            renderWarningModal={() => (
                <div className="form-control gap-2">
                    <h3 className="font-bold text-lg">
                        Are you sure you want to delete?
                    </h3>
                    <button
                        className="btn btn-outline btn-error"
                        aria-label="confirm delete project"
                        onClick={() => handleConfirmDeleteProject()}
                    >
                        Confirm
                    </button>
                </div>
            )}
        />
    );
};

export default ProjectDelete;
