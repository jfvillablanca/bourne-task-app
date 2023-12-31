import { Plus } from 'lucide-react';

import { Task } from '../api';
import { TaskCardProps } from '../common';
import { cn } from '../lib/utils';

import { Skeleton } from './ui';
import { TaskAdd, TaskCard, TaskCardGroupDropdown } from '.';

const TaskCardGroup: React.FC<TaskCardProps> = ({
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
            <div className={cn('', className)} {...props}>
                <div className="flex justify-between">
                    <h2 className="text-xl capitalize font-semibold tracking-tight mb-3 cursor-default">
                        {taskState}
                    </h2>
                    <TaskCardGroupDropdown
                        projectId={projectId}
                        taskState={taskState}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    {filteredTasks.map((task) => (
                        <TaskCard
                            key={task._id}
                            task={task}
                            projectId={projectId}
                        />
                    ))}
                    <TaskAdd taskState={taskState} projectId={projectId}>
                        <button
                            className="btn btn-outline border-1 btn-neutral h-min"
                            data-testid="add-task-button-plus"
                        >
                            <Plus strokeWidth={3} />
                        </button>
                    </TaskAdd>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('', className)} {...props}>
            <div className="flex justify-between">
                <Skeleton className="h-7 w-36 mb-3" />
                <Skeleton className="h-7 w-7 rounded-full" />
            </div>
            <Skeleton className="h-40 min-w-[16rem]" />
        </div>
    );
};

export default TaskCardGroup;
