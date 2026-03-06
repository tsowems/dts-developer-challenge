export interface Task {
    id: number;
    title: string;
    taskId: string;
    description: string | null;
    status: string;
    due_date: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateTask {
    title: string;
    description?: string | null;
    status?: string;
    dueDate: string;
}

export interface UpdateTaskStatus {
    taskId: string;
    status: string;
}


export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';