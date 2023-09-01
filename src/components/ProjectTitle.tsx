import { Check, Pencil } from 'lucide-react';
import { HTMLAttributes, useEffect, useState } from 'react';

import { Auth, Project } from '../api';
import { ProjectDto, User } from '../common';
import { cn } from '../lib/utils';

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from './ui';
import { FormSelectUsers, ProjectDelete, UserAvatars } from '.';

interface ProjectTitleProps extends HTMLAttributes<HTMLDivElement> {
    projectId: string;
}
const ProjectTitle: React.FC<
    HTMLAttributes<HTMLDivElement> & { projectId: string | null }
> = ({ className, projectId }) => {
    if (!projectId) {
        return (
            <h2
                className={cn('text-2xl font-medium tracking-tight', className)}
            >
                Select a project
            </h2>
        );
    } else {
        return (
            <ProjectTitleWrapped
                className={cn('text-2xl font-medium tracking-tight', className)}
                projectId={projectId}
            />
        );
    }
};

const ProjectTitleWrapped: React.FC<ProjectTitleProps> = ({
    className,
    projectId,
}) => {
    const [open, setOpen] = useState(false);
    const [projectMeta, setProjectMeta] = useState<ProjectDto>({
        title: '',
        description: '',
    });
    const [editProjectMeta, setEditProjectMeta] = useState(projectMeta);
    const [selectedCollaborators, setSelectedCollaborators] = useState<User[]>(
        [],
    );

    const allUsersQuery = Auth.useFindAllUsers();
    const projQueryMembers = Project.useGetProjectMembers(projectId);
    const projectQuery = Project.useFindOne(projectId);
    const projectMutation = Project.useUpdate(projectId);

    const handleMutation = () => {
        setProjectMeta(editProjectMeta);
        setOpen(false);
        projectMutation.mutate({
            title: editProjectMeta.title.trim(),
            description: editProjectMeta.description?.trim(),
        });
    };

    useEffect(() => {
        if (projectQuery.isSuccess && projQueryMembers.isSuccess) {
            setProjectMeta(() => projectQuery.data);
            setEditProjectMeta(() => projectQuery.data);
            setSelectedCollaborators(() =>
                projQueryMembers.data.filter((member) =>
                    projectQuery.data.collaborators.includes(member._id),
                ),
            );
        }
    }, [
        projectQuery.isSuccess,
        projectQuery.data,
        projQueryMembers.isSuccess,
        projQueryMembers.data,
    ]);

    const handleFormInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        setEditProjectMeta((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    if (projectQuery.data && allUsersQuery.data && projQueryMembers.data) {
        const project = projectQuery.data;
        const projectMembers = projQueryMembers.data;
        const allUsers = allUsersQuery.data.filter(
            (user) => user._id !== project.ownerId,
        );
        return (
            <div className="flex items-center">
                <div className={cn('flex items-center gap-2 h-14', className)}>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div className="flex gap-5 items-center">
                                <div
                                    className="btn btn-ghost flex gap-3 items-center data-[state=open]:bg-neutral -mx-4"
                                    data-testid={`project-title-${project._id}`}
                                    onClick={() => setOpen((v) => !v)}
                                >
                                    <h2 className="text-3xl font-medium tracking-tight normal-case">
                                        {projectMeta.title}
                                    </h2>
                                    <Pencil className="w-4" />
                                </div>
                                <ProjectDelete
                                    className="p-2"
                                    projectId={projectId}
                                />
                            </div>
                            {projectMeta.description && (
                                <h3 className="flex justify-start text-sm">
                                    {projectMeta.description}
                                </h3>
                            )}
                        </PopoverTrigger>
                        <PopoverContent className="min-w-[20rem]">
                            <form
                                className="form-control border p-4 backdrop-filter backdrop-blur-xl"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleMutation();
                                }}
                            >
                                <label className="label" htmlFor="title">
                                    <span className="label-text font-semibold">
                                        Title:
                                    </span>
                                </label>
                                <input
                                    className="input input-accent w-full"
                                    placeholder="New project name"
                                    required
                                    name="title"
                                    value={editProjectMeta.title}
                                    onChange={handleFormInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleMutation();
                                        }
                                    }}
                                    autoFocus={true}
                                />
                                <label className="label" htmlFor="description">
                                    <span className="label-text font-semibold">
                                        Summary:
                                    </span>
                                </label>
                                <textarea
                                    className="textarea textarea-accent h-full w-full resize-none mb-4"
                                    placeholder="Optional: Give a short summary of the project"
                                    name="description"
                                    value={editProjectMeta.description}
                                    onChange={handleFormInputChange}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleMutation();
                                        }
                                    }}
                                />
                                <button
                                    className="self-end btn btn-sm btn-ghost hover:btn-accent flex"
                                    type="submit"
                                >
                                    <Check className="w-4" />
                                    Submit
                                </button>
                            </form>
                        </PopoverContent>
                    </Popover>
                </div>
                <UserAvatars
                    className="h-11 w-max mr-1"
                    users={projectMembers}
                />
                <FormSelectUsers
                    allUsers={allUsers}
                    selectedUsers={selectedCollaborators}
                    handleChange={(selectedOption) => {
                        const collaboratorIds = selectedOption.map(
                            (option) => option._id,
                        );
                        const updatedCollaborators = projectMembers.filter(
                            (member) => collaboratorIds.includes(member._id),
                        );
                        setSelectedCollaborators(() => updatedCollaborators);
                        projectMutation.mutate({
                            collaborators: collaboratorIds,
                        });
                    }}
                />
            </div>
        );
    }

    return <Skeleton className={cn('h-11 max-w-md', className)} />;
};

export default ProjectTitle;
