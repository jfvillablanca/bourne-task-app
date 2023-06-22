import { HTMLAttributes } from 'react';

import { Project } from '../api';
import { cn } from '../lib/utils';

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
    const projectTaskStates = projectQuery.data?.taskStates;

    if (projectTaskStates) {
        return (
            <div className={cn('overflow-x-auto px-2', className)} {...props}>
                <div className="flex gap-2">
                    {projectTaskStates.map((taskState, i) => {
                        return (
                            <TaskCardGroup
                                key={i}
                                taskState={taskState}
                                projectId={projectId}
                            />
                        );
                    })}
                </div>
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

export default CardView;
