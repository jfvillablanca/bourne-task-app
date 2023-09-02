import { HTMLAttributes } from 'react';

import { User } from '../../common';
import { cn, generateAvatarURL } from '../../lib/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '.';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
    email: User['email'];
    showTooltipOnHover?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
    className,
    email,
    showTooltipOnHover = true,
}) => {
    return (
        <Tooltip>
            <TooltipTrigger>
                <div
                    className={cn(
                        'avatar cursor-auto h-11 bg-base-300 rounded-full border-2 border-accent-content',
                        className,
                    )}
                >
                    <img src={generateAvatarURL(email)} alt={email} />
                </div>
            </TooltipTrigger>
            {showTooltipOnHover && (
                <TooltipContent className="p-2 bg-base-100 shadow shadow-neutral rounded-sm">
                    {email}
                </TooltipContent>
            )}
        </Tooltip>
    );
};
