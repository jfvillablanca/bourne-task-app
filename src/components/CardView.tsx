import { HTMLAttributes } from 'react';

import { Project } from '../api';
import { cn } from '../lib/utils';

import { Skeleton } from './ui';
import { TaskCardGroup } from '.';

interface CardViewProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}

const CardView: React.FC<CardViewProps> = ({
    className,
    projectId,
    ...props
}) => {
    const projectQuery = Project.useFindOne(projectId);

    if (projectQuery.data) {
        const currentProject = projectQuery.data;

        return (
            <div className={cn('flex overflow-x-auto', className)} {...props}>
                {currentProject.taskStates.map((taskState, i) => {
                    return (
                        <TaskCardGroup
                            className="w-full mr-4 min-w-[26rem]"
                            key={i}
                            taskState={taskState}
                            projectId={projectId}
                        />
                    );
                })}
            </div>
        );
    }

    return (
        <ul className={cn('flex gap-2 overflow-x-auto', className)}>
            {Array.from({ length: 3 }).map((_, i) => {
                return (
                    <li key={i}>
                        <Skeleton className="h-40 mr-4 mt-6 min-w-[26rem]" />
                    </li>
                );
            })}
        </ul>
    );
};

export default CardView;
