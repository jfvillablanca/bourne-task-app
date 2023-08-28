import { HTMLAttributes } from 'react';

import { User } from '../../common';
import { cn, generateAvatarURL } from '../../lib/utils';

export const Avatar: React.FC<
    HTMLAttributes<HTMLDivElement> & { email: User['email'] }
> = ({ email, className }) => {
    return (
        <div
            className={cn(
                'avatar h-11 bg-base-300 rounded-full border-2 border-accent-content',
                className,
            )}
        >
            <img src={generateAvatarURL(email)} alt={email} />
        </div>
    );
};
