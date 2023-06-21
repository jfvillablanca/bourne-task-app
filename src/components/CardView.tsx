import { HTMLAttributes } from 'react';

import { Task } from '../api';
import { cn } from '../lib/utils';

interface CardViewProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}

const CardView: React.FC<CardViewProps> = ({ className, projectId, ...props }) => {
    const tasksQuery = Task.useFindAll(projectId);
    const tasks = tasksQuery.data;

    if (tasks) {
        return (
            <div className={cn('', className)} {...props}>
                <h2>Project Task</h2>
                <div>
                    {tasks.map((task) => (
                        <div key={task._id}>{task.title}</div>
                    ))}
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
