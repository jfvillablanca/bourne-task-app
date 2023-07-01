import { X } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export const ExitButton: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    return (
        <div
            role="button"
            className={cn('btn btn-sm btn-circle btn-ghost', className)}
            {...props}
        >
            <X className="text-sm" />
        </div>
    );
};
