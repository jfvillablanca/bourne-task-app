import { HTMLAttributes } from 'react';

import { Project } from '../api';
import { cn } from '../lib/utils';

const Sidebar: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const projects = Project.useFindAll();

    if (projects.data) {
        return (
            <div className={cn('', className)} {...props}>
                <h2>Project List</h2>
                <ul>
                    {projects.data.map((project) => (
                        <li key={project._id}>{project.title}</li>
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

export default Sidebar;
