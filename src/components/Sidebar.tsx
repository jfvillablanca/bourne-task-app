import { HTMLAttributes } from 'react';

import { UseQueryResult } from '@tanstack/react-query';

import { ProjectDocument } from '../common';
import { cn } from '../lib/utils';

import { Skeleton } from './ui';
import { ProjectAdd } from '.';

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
    return (
        <div className={cn('flex flex-col px-3', className)} {...props}>
            <h2 className="font-bold text-2xl self-center tracking-wider cursor-default">
                My Projects
            </h2>
            <div className="divider my-1"></div>
            <ul className="menu gap-2">
                {projectQuery && projectQuery.data
                    ? projectQuery.data.map((project) => (
                          <li
                              className="btn btn-ghost text-lg font-semibold capitalize h-min"
                              key={project._id}
                              onClick={() => {
                                  handleClickedProject(project._id);
                              }}
                          >
                              {project.title}
                          </li>
                      ))
                    : Array.from({ length: 3 }).map((_, i) => {
                          return (
                              <li key={i}>
                                  <Skeleton className="h-8 mb-1" />
                              </li>
                          );
                      })}
            </ul>
            {projectQuery && projectQuery.data && (
                <ProjectAdd className="mx-2" />
            )}
        </div>
    );
};

export default Sidebar;
