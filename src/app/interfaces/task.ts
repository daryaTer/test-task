export interface Task {
    id?: number;
    username: string;
    email: string;
    text: string;
    image_path?: string;
    status?: Status;
}

export type Status = 0 | 1 | 10 | 11;
