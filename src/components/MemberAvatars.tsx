import { HTMLAttributes } from 'react';

import { Project } from '../api';
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

        return (
            <div className={cn('', className)} {...props}>
                <ul className="avatar-group -space-x-5">
                    {avatarsToDisplay.map((avatar) => {
                        return (
                            <li className="avatar border-none" key={avatar._id}>
                                <div
                                    className={cn(
                                        'w-full h-8 m-1 bg-base-300 rounded-full border-2 border-accent-content',
                                        className,
                                    )}
                                >
                                    <img
                                        src={generateAvatarURL(avatar.email)}
                                        alt={avatar.email}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return <div className="loading loading-spinner loading-xs"></div>;
};

export default MemberAvatars;
