import { cn } from '../../lib/utils';

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-disabled
            aria-label="loading"
            className={cn(
                'animate-pulse rounded-xl bg-neutral-content/30',
                className,
            )}
            {...props}
        />
    );
}

export { Skeleton };
