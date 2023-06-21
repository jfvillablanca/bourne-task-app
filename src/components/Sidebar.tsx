import { HTMLAttributes } from 'react';

import { ProjectDocument } from '../common';
import { cn } from '../lib/utils';

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
    projects: ProjectDocument[] | undefined;
    handleClickedProject: (projectId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    className,
    projects,
    handleClickedProject,
    ...props
}) => {
    if (projects) {
        return (
            <div className={cn('', className)} {...props}>
                <h2>Project List</h2>
                <ul>
                    {projects.map((project) => (
                        <li
                            key={project._id}
                            onClick={() => {
                                handleClickedProject(project._id);
                            }}
                        >
                            {project.title}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className={cn('', className)} {...props}>
            <ul>
                <li>Loading...</li>
                <li>Loading...</li>
                <li>Loading...</li>
            </ul>
        </div>
    );
};

export default Sidebar;
