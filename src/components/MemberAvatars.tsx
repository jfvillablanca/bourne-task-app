import { HTMLAttributes } from 'react';

import { User } from '../common';
import { cn } from '../lib/utils';

import { Avatar } from './ui';

interface UserAvatarsProps extends HTMLAttributes<HTMLDivElement> {
    users: User[];
}

const UserAvatars: React.FC<UserAvatarsProps> = ({
    className,
    users,
    ...props
}) => {
    const renderAvatar = (avatar?: User) => {
        const avatarClass = !avatar ? 'placeholder font-semibold' : '';
        const avatarCount = !avatar ? `+${users.length - 2}` : '';

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
                    <span className="text-md">{avatarCount}</span>
                )}
            </li>
        );
    };

    const avatarsToRender = users.length < 3 ? users : users.slice(0, 2);

    const renderedAvatars = avatarsToRender.map((avatar) =>
        renderAvatar(avatar),
    );

    if (users.length > 2) {
        renderedAvatars.push(renderAvatar(undefined));
    }

    return (
        <div className={cn('', className)} {...props}>
            <ul className="avatar-group -space-x-5">{renderedAvatars}</ul>
        </div>
    );
};

export default UserAvatars;
