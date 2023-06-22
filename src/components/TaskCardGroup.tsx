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
            <div
                className={cn('bg-base-200 p-3 rounded-lg border', className)}
                {...props}
            >
                <h2 className="capitalize text-xl font-semibold tracking-tight mb-3">
                    {taskState}
                </h2>
                <div className="flex flex-col gap-4">
                    {filteredTasks.map((task) => (
                        <div
                            key={task._id}
                            className="card collapse p-2 rounded-lg border"
                        >
                            <input type="checkbox" />
                            <h3 className="card-title collapse-title text-sm font-bold">
                                {task.title}
                            </h3>
                            <div className="collapse-content">
                                <p>{task.description}</p>
                            </div>
                        </div>
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

export default TaskCardGroup;
