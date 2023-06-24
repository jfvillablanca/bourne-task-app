import { HTMLAttributes } from 'react';

import { Task } from '../api';
import { cn } from '../lib/utils';

import { TaskCard } from '.';
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
        const filteredTasks = Task.filterByTaskState(tasks, taskState);

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
                        <TaskCard
                            key={task._id}
                            task={task}
                            projectId={projectId}
                        />
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
