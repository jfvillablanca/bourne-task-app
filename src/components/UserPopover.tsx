import { CircleDotIcon } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { useToggle } from 'usehooks-ts';

import { Auth } from '../api';
import { cn } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger } from './ui';

const UserPopover: React.FC<HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...props
}) => {
    const [open, toggleOpen, setOpen] = useToggle();
    const user = Auth.useUser();
    const logout = Auth.useLogout();

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            placement="bottom"
            placementStrategy={{
                padding: 4,
            }}
        >
            <PopoverTrigger asChild>
                <button
                    className="ml-auto mr-2"
                    data-testid="open-user-info-popover"
                    onClick={toggleOpen}
                >
                    <div className="avatar flex items-center">
                        {/* TODO: This is a placeholder */}
                        <CircleDotIcon className="btn bg-transparent hover:bg-transparent border-none h-9 w-max" />
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                className={cn(
                    'border p-4 backdrop-filter backdrop-blur-xl',
                    className,
                )}
                {...props}
            >
                {user.data ? (
                    <div className="menu">
                        <h2>{user.data.email}</h2>
                        <button
                            className="btn"
                            disabled={logout.isLoading}
                            onClick={() => logout.mutate({})}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </PopoverContent>
        </Popover>
    );
};

export default UserPopover;
