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
                <ul className="flex gap-1">
                    {avatarsToDisplay.map((avatar) => {
                        return (
                            <li className="avatar" key={avatar._id}>
                                <div className="rounded-full w-5 h-5">
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
