import { X } from 'lucide-react';
import { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

export const ExitButton: React.FC<HTMLAttributes<HTMLButtonElement>> = ({
    className,
    ...props
}) => {
    return (
        <button
            className={cn('btn btn-sm btn-circle btn-ghost', className)}
            {...props}
        >
            <X className="text-sm" />
        </button>
    );
};
