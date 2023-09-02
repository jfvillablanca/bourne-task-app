import { HTMLAttributes } from 'react';

import { User } from '../common';
import { cn } from '../lib/utils';

import { Avatar, AvatarGroupCount } from './ui';

interface UserAvatarsProps extends HTMLAttributes<HTMLDivElement> {
    users: User[];
    minAvatarsToDisplay?: number;
}

const UserAvatars: React.FC<UserAvatarsProps> = ({
    className,
    users,
    minAvatarsToDisplay = 2,
    ...props
}) => {
    const renderAvatar = (avatar?: User) => {
        const avatarClass = !avatar ? 'placeholder font-semibold text-md' : '';
        const avatarCount = !avatar
            ? `+${users.length - minAvatarsToDisplay}`
            : '';

        return (
            <li
                className={`avatar border-none ${avatarClass}`}
                key={avatar?._id ?? 'placeholder'}
            >
                {avatar ? (
                    <Avatar
                        className="w-full h-10 bg-base-300 rounded-full border-2 border-accent-content"
                        email={avatar.email}
                    />
                ) : (
                    <AvatarGroupCount
                        avatarCount={avatarCount}
                        consolidatedUsers={users.slice(
                            minAvatarsToDisplay - users.length,
                        )}
                    />
                )}
            </li>
        );
    };

    const avatarsToRender =
        users.length <= minAvatarsToDisplay
            ? users
            : users.slice(0, minAvatarsToDisplay);

    const renderedAvatars = avatarsToRender.map((avatar) =>
        renderAvatar(avatar),
    );

    if (users.length > minAvatarsToDisplay) {
        renderedAvatars.push(renderAvatar(undefined));
    }

    return (
        <div className={cn('', className)} {...props}>
            <ul className="avatar-group -space-x-5">{renderedAvatars}</ul>
        </div>
    );
};

export default UserAvatars;
