import { HTMLAttributes } from 'react';

import { Task } from '../api';
import { cn } from '../lib/utils';

interface MainProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}

const CardView: React.FC<MainProps> = ({ className, projectId, ...props }) => {
    const tasksQuery = Task.useFindAll(projectId);
    const tasks = tasksQuery.data;

    if (tasks) {
        return (
            <div className={cn('', className)} {...props}>
                <h2>Project Task</h2>
                <ul>
                    {tasks.map((task) => (
                        <li key={task._id}>{task.title}</li>
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

export default CardView;
