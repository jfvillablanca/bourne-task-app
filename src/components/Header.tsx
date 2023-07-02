import { GanttChart } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { cn } from '../lib/utils';

const Header: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {

    return (
        <div className={cn('flex p-4 items-center', className)} {...props}>
            <GanttChart className="h-12 w-max mr-2" />
            <h2 className="font-bold tracking-wide">Bourne Task App</h2>
        </div>
    );
};

export default Header;