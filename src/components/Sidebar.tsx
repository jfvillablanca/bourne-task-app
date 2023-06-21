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

    return (
        <div className={cn('flex flex-col px-3', className)} {...props}>
            <h2 className='self-center'>My Projects</h2>
            <ul className='menu gap-2'>
                {projects
                    ? projects.map((project) => (
                          <li
                              className='btn'
                              key={project._id}
                              onClick={() => {
                                  handleClickedProject(project._id);
                              }}
                          >
                              {project.title}
                          </li>
                      ))
                    : Array.from({ length: 3 }).map((_, i) => (
                          <li key={i}>Loading...</li>
                      ))}
            </ul>
        </div>
    );
};

export default Sidebar;
