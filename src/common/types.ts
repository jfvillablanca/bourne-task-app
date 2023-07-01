export type SubTask = {
    title: string;
    isCompleted: boolean;
};

export type UpdateTaskDto = {
    title?: string;
    taskState?: string;
    description?: string;
    subtasks?: SubTask[];
    assignedProjMemberId?: string[];
};

export type TaskDto = {
    title: string;
    taskState: string;
    description?: string;
    subtasks?: SubTask[];
    assignedProjMemberId?: string[];
};

export type TaskDocument = TaskDto & {
    _id: string;
};

export type UpdateProjectDto = {
    title?: string;
    description?: string;
    collaborators?: string[];
    taskStates?: string[];
    tasks?: TaskDocument[];
};

export type ProjectDto = {
    title: string;
    description?: string;
};

export type ProjectDocument = ProjectDto & {
    _id: string;
    ownerId: string;
    collaborators: string[];
    taskStates: string[];
    tasks: TaskDocument[];
    createdAt: string;
    updatedAt: string;
};

export type ProjectMember = {
    _id: string;
    email: string;
};

export type FormElementType =
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;
export type FormChangeType =
    | React.ChangeEvent<FormElementType>
    | { name: string; value: string[] };
