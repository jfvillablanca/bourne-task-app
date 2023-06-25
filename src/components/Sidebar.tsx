import { HTMLAttributes } from 'react';

import { UseQueryResult } from '@tanstack/react-query';

import { ProjectDocument } from '../common';
import { cn } from '../lib/utils';

interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
    projectQuery: UseQueryResult<ProjectDocument[], unknown> | undefined;
    handleClickedProject: (projectId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    className,
    projectQuery,
    handleClickedProject,
    ...props
}) => {
    if (projectQuery && projectQuery.data) {
        return (
            <div className={cn('flex flex-col px-3', className)} {...props}>
                <h2 className="self-center">My Projects</h2>
                <ul className="menu gap-2">
                    {projectQuery.data.map((project) => (
                        <li
                            className="btn capitalize border border-base-content"
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
        <div className={cn('flex flex-col px-3', className)} {...props}>
            <ul className="menu gap-2">
                {Array.from({ length: 3 }).map((_, i) => {
                    return <li key={i}>Loading...</li>;
                })}
            </ul>
        </div>
    );
};

export default Sidebar;
