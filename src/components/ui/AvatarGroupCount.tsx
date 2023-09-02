import { HTMLAttributes } from 'react';

import { User } from '../../common';
import { cn } from '../../lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '.';

interface AvatarGroupCountProps extends HTMLAttributes<HTMLDivElement> {
    avatarCount: string;
    consolidatedUsers: User[];
    minUsersToDisplay?: number;
}

export const AvatarGroupCount: React.FC<AvatarGroupCountProps> = ({
    className,
    avatarCount,
    consolidatedUsers,
    minUsersToDisplay = 3,
}) => {
    const displayedUsers =
        consolidatedUsers.length <= minUsersToDisplay
            ? consolidatedUsers.map((user) => (
                  <li key={user._id}>{user.email}</li>
              ))
            : consolidatedUsers
                  .slice(0, minUsersToDisplay)
                  .map((user) => <li key={user._id}>{user.email}</li>)
                  .concat(
                      <li key="placeholder">{`and ${
                          consolidatedUsers.length - minUsersToDisplay
                      } more`}</li>,
                  );

    return (
        <Tooltip>
            <TooltipTrigger>
                <span
                    className={cn(
                        'w-10 h-10 grid place-items-center bg-base-300 rounded-full border-2 border-accent-content',
                        className,
                    )}
                >
                    {avatarCount}
                </span>
            </TooltipTrigger>
            <TooltipContent className="p-2 bg-base-100 shadow shadow-neutral rounded-sm">
                <ul>{displayedUsers}</ul>
            </TooltipContent>
        </Tooltip>
    );
};
