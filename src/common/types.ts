export type TaskDto = {
    title: string;
    description?: string;
    assignedProjMemberId: string[];
};

export type TaskDocument = TaskDto & {
    _id: string;
};

export type ProjectDto = {
    title: string;
    description?: string;
    collaborators: string[];
    tasks: TaskDocument[];
};

export type ProjectDocument = ProjectDto & {
    _id: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
};
