import axios, { AxiosError } from 'axios';
import type { Task, CreateTaskInput, ApiResponse } from '../types/tasks';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse<never>>) => {
        const message = error.response?.data?.error || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

// ✅ Helper function to transform snake_case to camelCase
const transformTask = (task: any): Task => {
    return {
        id: task.id,
        taskId: task.task_id,  // ✅ Transform snake_case to camelCase
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.due_date,  // ✅ Transform snake_case to camelCase
        createdAt: task.created_at,  // ✅ Transform snake_case to camelCase
        updatedAt: task.updated_at,  // ✅ Transform snake_case to camelCase
        deletedAt: task.deleted_at,  // ✅ Transform snake_case to camelCase
    };
};

export const taskApi = {
    // Get all tasks
    async getAllTasks(): Promise<Task[]> {
        const response = await apiClient.get<ApiResponse<any[]>>('/tasks');
        const tasks = response.data.data || [];
        return tasks.map(transformTask);  // ✅ Transform each task
    },

    // Get task by ID
    async getTaskById(taskId: string): Promise<Task> {
        const response = await apiClient.get<ApiResponse<any>>(`/tasks/${taskId}`);
        if (!response.data.data) {
            throw new Error('Task not found');
        }
        return transformTask(response.data.data);  // ✅ Transform the task
    },

    // Create a new task
    async createTask(task: CreateTaskInput): Promise<Task> {
        // ✅ Transform camelCase to snake_case for the request
        const payload = {
            title: task.title,
            description: task.description,
            status: task.status,
            dueDate: task.dueDate,  // ✅ Transform to snake_case
        };

        const response = await apiClient.post<ApiResponse<any>>('/tasks', payload);
        if (!response.data.data) {
            throw new Error('Failed to create task');
        }
        return transformTask(response.data.data);  // ✅ Transform response
    },

    // Update task status
    async updateTaskStatus(taskId: string, status: string): Promise<Task> {
        const response = await apiClient.patch<ApiResponse<any>>(`/tasks/${taskId}/status`, {
            status,
        });
        if (!response.data.data) {
            throw new Error('Failed to update task');
        }
        return transformTask(response.data.data);  // ✅ Transform response
    },

    // Delete task (soft delete)
    async deleteTask(taskId: string): Promise<void> {
        await apiClient.delete(`/tasks/${taskId}`);
    },
};

export default taskApi;