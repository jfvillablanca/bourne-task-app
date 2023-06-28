import { HTMLAttributes } from 'react';

import { Project } from '../api';
import { ProjectMember } from '../common';
import { cn } from '../lib/utils';

const diceBearArtStyle = [
    'pixel-art',
    'lorelei',
    'adventurer',
    'big-smile',
    'identicon',
];
const generateAvatarURL = (seed: string) =>
    `https://api.dicebear.com/6.x/${diceBearArtStyle[1]}/svg?seed=${seed}`;

interface UserAvatarProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
    taskMemberIds?: string[];
}

const MemberAvatars: React.FC<UserAvatarProps> = ({
    className,
    projectId,
    taskMemberIds,
    ...props
}) => {
    const projectMembersQuery = Project.useGetProjectMembers(projectId);

    if (projectMembersQuery.data) {
        const projectMembers = projectMembersQuery.data;

        const avatarsToDisplay = taskMemberIds
            ? projectMembers.filter((assignee) =>
                  taskMemberIds.includes(assignee._id),
              )
            : projectMembers;

        const renderAvatar = (avatar?: ProjectMember) => {
            const avatarClass = !avatar ? 'placeholder' : '';
            const avatarCount = !avatar
                ? `+${avatarsToDisplay.length - 2}`
                : '';

            return (
                <li
                    className={`avatar border-none ${avatarClass}`}
                    key={avatar?._id ?? 'placeholder'}
                >
                    <div
                        className={cn(
                            'w-full h-10 m-1 bg-base-300 rounded-full border-2 border-accent-content',
                            className,
                        )}
                    >
                        {avatar ? (
                            <img
                                src={generateAvatarURL(avatar.email)}
                                alt={avatar.email}
                            />
                        ) : (
                            <span className="text-md">{avatarCount}</span>
                        )}
                    </div>
                </li>
            );
        };

        const avatarsToRender =
            avatarsToDisplay.length < 3
                ? avatarsToDisplay
                : avatarsToDisplay.slice(0, 2);

        const renderedAvatars = avatarsToRender.map((avatar) =>
            renderAvatar(avatar),
        );

        if (avatarsToDisplay.length > 2) {
            renderedAvatars.push(renderAvatar(undefined));
        }

        return (
            <div className={cn('', className)} {...props}>
                <ul className="avatar-group -space-x-5">{renderedAvatars}</ul>
            </div>
        );
    }

    return <div className="loading loading-spinner loading-xs"></div>;
};

export default MemberAvatars;
