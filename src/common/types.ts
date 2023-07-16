export type UpdateTaskDto = {
    title?: string;
    taskState?: string;
    description?: string;
    assignedProjMemberId?: string[];
};

export type TaskDto = {
    title: string;
    taskState: string;
    description?: string;
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

export type DecodedToken = {
    sub: string;
    email: string;
    iat: number;
    exp: number;
};

export type AuthToken = { access_token: string; refresh_token: string };

export type AuthDto = Pick<User, 'email'> & { password: string };

export type ProjectMember = Pick<User, '_id' | 'email'>;

export type User = {
    _id: string;
    email: string;
};

export type MockedUser = User & {
    hashed_password: string;
    refresh_token: string | null;
};

export type FormElementType =
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;

export type FormChangeType =
    | React.ChangeEvent<FormElementType>
    | { name: string; value: string };
