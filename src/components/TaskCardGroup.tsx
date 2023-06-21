import { HTMLAttributes } from 'react';

import { Task } from '../api';
import { cn } from '../lib/utils';
interface TaskCardGroupProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
    taskState: string;
}

const TaskCardGroup: React.FC<TaskCardGroupProps> = ({
    className,
    projectId,
    taskState,
    ...props
}) => {
    const tasksQuery = Task.useFindAll(projectId);
    const tasks = tasksQuery.data;

    if (tasks) {
        const filteredTasks = tasks.filter((task) => {
            return task.taskState === taskState;
        });

        return (
            <div className={cn('', className)} {...props}>
                <h2>{taskState}</h2>
                {filteredTasks.map((task) => (
                    <div key={task._id}>{task.title}</div>
                ))}
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

export default TaskCardGroup;
