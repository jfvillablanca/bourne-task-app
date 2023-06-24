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

    if (projectQuery.data) {
        const currentProject = projectQuery.data;

        return (
            <div className={cn('flex overflow-x-auto', className)} {...props}>
                {currentProject.taskStates.map((taskState, i) => {
                    return (
                        <TaskCardGroup
                            className="w-full mr-4 min-w-[16rem]"
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
