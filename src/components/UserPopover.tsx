import { HTMLAttributes } from 'react';
import { useToggle } from 'usehooks-ts';

import { Auth } from '../api';
import { User } from '../common';
import { cn, generateAvatarURL } from '../lib/utils';

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
                    {user.data && <Avatar user={user.data} />}
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
                        <div className="flex gap-2 mb-2">
                            <Avatar className="h-14" user={user.data} />
                            <h2 className="font-semibold">{user.data.email}</h2>
                        </div>
                        <button
                            className="btn"
                            disabled={logout.isLoading}
                            onClick={() => logout.mutate()}
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

const Avatar: React.FC<HTMLAttributes<HTMLDivElement> & { user: User }> = ({
    user,
    className,
}) => {
    return (
        <div
            className={cn(
                'avatar h-11 bg-base-300 rounded-full border-2 border-accent-content',
                className,
            )}
        >
            {user && (
                <img src={generateAvatarURL(user.email)} alt={user.email} />
            )}
        </div>
    );
};

export default UserPopover;
