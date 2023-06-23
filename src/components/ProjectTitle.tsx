import { HTMLAttributes, useEffect, useState } from 'react';

import { Project } from '../api';
import { cn } from '../lib/utils';

interface ProjectTitleProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}
const ProjectTitle: React.FC<ProjectTitleProps> = ({
    className,
    projectId,
}) => {
    const [title, setTitle] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const projectQuery = Project.useFindOne(projectId);
    const projectMutation = Project.useUpdate(projectId);

    const handleMutation = () => {
        projectMutation.mutate({ title: title.trim() });
        setIsEditMode(false);
    };

    useEffect(() => {
        if (projectQuery.isSuccess) {
            setTitle(() => projectQuery.data.title);
        }
    }, [projectQuery.isSuccess, projectQuery.data]);

    if (projectQuery.data) {
        return (
            <div className={cn('overflow-x-auto px-2', className)}>
                {isEditMode ? (
                    <input
                        value={title}
                        onChange={(e) => {
                            e.preventDefault();
                            setTitle(() => e.target.value);
                        }}
                        onBlur={handleMutation}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleMutation();
                            }
                        }}
                        autoFocus={true}
                    />
                ) : (
                    <h2
                        className="cursor-text"
                        onClick={() => {
                            setIsEditMode(true);
                        }}
                    >
                        {title}
                    </h2>
                )}
            </div>
        );
    }

    return <h2>Loading...</h2>;
};

export default ProjectTitle;
