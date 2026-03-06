import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createTask,
    getTaskById,
    getAllTasks,
    updateTaskStatus,
    deleteTask,
    titleExists,
    isValidUUID,
} from '../models/Task';
import { sql } from '../config/database';

// Mock the database module
vi.mock('../config/database', () => ({
    sql: vi.fn(),
}));

// Mock uuid
vi.mock('uuid', () => ({
    v4: vi.fn(() => 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
}));

// Define mock type for Task (matches database column names)
export type Task = {
    id: number;
    task_id: string;
    title: string;
    description: string | null;
    status: string;
    due_date: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

// Valid UUIDs for testing
const VALID_UUID_1 = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const VALID_UUID_2 = 'b1ffcd00-0d1c-4fg9-8c7e-7ccace491b22';
const NON_EXISTENT_UUID = 'ffffffff-ffff-4fff-bfff-ffffffffffff';

// Define mock data
const mockTask: Task = {
    id: 1,
    task_id: VALID_UUID_1,
    title: 'Complete project',
    description: 'Finish the backend API',
    status: 'pending',
    due_date: '2024-12-31T23:59:59Z',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    deleted_at: null,
};

const mockDeletedTask: Task = {
    ...mockTask,
    id: 2,
    task_id: VALID_UUID_2,
    title: 'Deleted task',
    deleted_at: '2024-06-01T00:00:00Z',
};

const mockTasks: Task[] = [
    mockTask,
    {
        id: 2,
        task_id: 'b1ffcd00-0d1c-4fg9-8c7e-7ccace491b22',
        title: 'Review code',
        description: null,
        status: 'in_progress',
        due_date: '2024-11-15T12:00:00Z',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        deleted_at: null,
    },
    {
        id: 3,
        task_id: 'c2ggde11-1e2d-4gh0-9d8f-8ddbdf502c33',
        title: 'Write documentation',
        description: 'API documentation',
        status: 'completed',
        due_date: '2024-10-01T09:00:00Z',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
        deleted_at: null,
    },
];

// Reset mocks before each test
beforeEach(() => {
    vi.clearAllMocks();
});

// ============== CREATE TASK TESTS ==============

describe('createTask', () => {
    it('should create a task with all fields', async () => {
        const taskData = {
            title: 'Complete project',
            description: 'Finish the backend API',
            status: 'pending' as const,
            dueDate: '2024-12-31T23:59:59Z',
        };

        // First call: titleExists check (returns no existing task)
        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        // Second call: insert task
        (sql as any).mockResolvedValueOnce([mockTask]);

        const task = await createTask(taskData);

        expect(task).toEqual(mockTask);
        expect(sql).toHaveBeenCalledTimes(2);
    });

    it('should create a task with default values (only title and dueDate)', async () => {
        const taskData = {
            title: 'Simple task',
            dueDate: '2024-12-31T23:59:59Z',
        };

        const expectedTask: Task = {
            ...mockTask,
            title: 'Simple task',
            description: null,
            status: 'pending',
        };

        // First call: titleExists check
        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        // Second call: insert task
        (sql as any).mockResolvedValueOnce([expectedTask]);

        const task = await createTask(taskData);

        expect(task.title).toBe('Simple task');
        expect(task.description).toBeNull();
        expect(task.status).toBe('pending');
    });

    it('should create a task with null description', async () => {
        const taskData = {
            title: 'Task without description',
            description: null,
            status: 'pending' as const,
            dueDate: '2024-12-31T23:59:59Z',
        };

        const expectedTask: Task = {
            ...mockTask,
            title: 'Task without description',
            description: null,
        };

        // First call: titleExists check
        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        // Second call: insert task
        (sql as any).mockResolvedValueOnce([expectedTask]);

        const task = await createTask(taskData);

        expect(task.description).toBeNull();
    });

    it('should throw error when creating task with duplicate title', async () => {
        const taskData = {
            title: 'Existing Task',
            dueDate: '2024-12-31T23:59:59Z',
        };

        // titleExists returns true (duplicate found)
        (sql as any).mockResolvedValueOnce([{ exists: true }]);

        await expect(createTask(taskData)).rejects.toThrow(
            'Task with title "Existing Task" already exists'
        );
        expect(sql).toHaveBeenCalledTimes(1); // Only titleExists called
    });

    it('should trim whitespace from title', async () => {
        const taskData = {
            title: '  Trimmed Title  ',
            dueDate: '2024-12-31T23:59:59Z',
        };

        const expectedTask: Task = {
            ...mockTask,
            title: 'Trimmed Title',
        };

        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockResolvedValueOnce([expectedTask]);

        const task = await createTask(taskData);

        expect(task.title).toBe('Trimmed Title');
    });

    it('should create task with different status values', async () => {
        const statuses = ['pending', 'in_progress', 'completed'] as const;

        for (const status of statuses) {
            vi.clearAllMocks();

            const taskData = {
                title: `Task with ${status}`,
                dueDate: '2024-12-31T23:59:59Z',
                status,
            };

            const expectedTask: Task = {
                ...mockTask,
                title: `Task with ${status}`,
                status,
            };

            (sql as any).mockResolvedValueOnce([{ exists: false }]);
            (sql as any).mockResolvedValueOnce([expectedTask]);

            const task = await createTask(taskData);

            expect(task.status).toBe(status);
        }
    });
});

// ============== GET TASK BY ID TESTS ==============

describe('getTaskById', () => {
    it('should return a task by taskId', async () => {
        (sql as any).mockResolvedValueOnce([mockTask]);

        const task = await getTaskById(VALID_UUID_1);

        expect(task).toEqual(mockTask);
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should return null if task not found', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const task = await getTaskById(NON_EXISTENT_UUID);

        expect(task).toBeNull();
    });

    it('should return deleted task when includeDeleted is true', async () => {
        (sql as any).mockResolvedValueOnce([mockDeletedTask]);

        const task = await getTaskById(VALID_UUID_2, true);

        expect(task).toEqual(mockDeletedTask);
        expect(task?.deleted_at).not.toBeNull();
    });

    it('should not return deleted task when includeDeleted is false', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const task = await getTaskById(VALID_UUID_2, false);

        expect(task).toBeNull();
    });

    it('should default includeDeleted to false', async () => {
        (sql as any).mockResolvedValueOnce([mockTask]);

        const task = await getTaskById(VALID_UUID_1);

        expect(task).toEqual(mockTask);
        // The query should filter out deleted tasks by default
    });
});

// ============== GET ALL TASKS TESTS ==============

describe('getAllTasks', () => {
    it('should return all non-deleted tasks', async () => {
        (sql as any).mockResolvedValueOnce(mockTasks);

        const tasks = await getAllTasks();

        expect(tasks).toEqual(mockTasks);
        expect(tasks.length).toBe(3);
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no tasks exist', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const tasks = await getAllTasks();

        expect(tasks).toEqual([]);
        expect(tasks.length).toBe(0);
    });

    it('should include deleted tasks when includeDeleted is true', async () => {
        const tasksWithDeleted = [...mockTasks, mockDeletedTask];
        (sql as any).mockResolvedValueOnce(tasksWithDeleted);

        const tasks = await getAllTasks(true);

        expect(tasks.length).toBe(4);
        expect(tasks.some((t) => t.deleted_at !== null)).toBe(true);
    });

    it('should exclude deleted tasks by default', async () => {
        (sql as any).mockResolvedValueOnce(mockTasks);

        const tasks = await getAllTasks();

        expect(tasks.every((t) => t.deleted_at === null)).toBe(true);
    });

    it('should return tasks ordered by created_at DESC', async () => {
        (sql as any).mockResolvedValueOnce(mockTasks);

        const tasks = await getAllTasks();

        expect(tasks).toEqual(mockTasks);
        // The mock data should be in order
    });
});

// ============== UPDATE TASK STATUS TESTS ==============

describe('updateTaskStatus', () => {
    it('should update task status to in_progress', async () => {
        const updatedTask: Task = {
            ...mockTask,
            status: 'in_progress',
            updated_at: '2024-06-01T00:00:00Z',
        };

        (sql as any).mockResolvedValueOnce([updatedTask]);

        const task = await updateTaskStatus({
            taskId: VALID_UUID_1,
            status: 'in_progress',
        });

        expect(task?.status).toBe('in_progress');
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should update task status to completed', async () => {
        const updatedTask: Task = {
            ...mockTask,
            status: 'completed',
            updated_at: '2024-06-01T00:00:00Z',
        };

        (sql as any).mockResolvedValueOnce([updatedTask]);

        const task = await updateTaskStatus({
            taskId: VALID_UUID_1,
            status: 'completed',
        });

        expect(task?.status).toBe('completed');
    });

    it('should update task status to pending', async () => {
        const updatedTask: Task = {
            ...mockTask,
            status: 'pending',
            updated_at: '2024-06-01T00:00:00Z',
        };

        (sql as any).mockResolvedValueOnce([updatedTask]);

        const task = await updateTaskStatus({
            taskId: VALID_UUID_1,
            status: 'pending',
        });

        expect(task?.status).toBe('pending');
    });

    it('should update task status to cancelled', async () => {
        const updatedTask: Task = {
            ...mockTask,
            status: 'cancelled',
            updated_at: '2024-06-01T00:00:00Z',
        };

        (sql as any).mockResolvedValueOnce([updatedTask]);

        const task = await updateTaskStatus({
            taskId: VALID_UUID_1,
            status: 'cancelled',
        });

        expect(task?.status).toBe('cancelled');
    });

    it('should return null if task not found', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const task = await updateTaskStatus({
            taskId: NON_EXISTENT_UUID,
            status: 'completed',
        });

        expect(task).toBeNull();
    });

    it('should return null if task is already deleted', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const task = await updateTaskStatus({
            taskId: VALID_UUID_2, // deleted task
            status: 'completed',
        });

        expect(task).toBeNull();
    });

    it('should update the updated_at timestamp', async () => {
        const updatedTask: Task = {
            ...mockTask,
            status: 'completed',
            updated_at: '2024-06-15T10:30:00Z',
        };

        (sql as any).mockResolvedValueOnce([updatedTask]);

        const task = await updateTaskStatus({
            taskId: VALID_UUID_1,
            status: 'completed',
        });

        expect(task?.updated_at).toBe('2024-06-15T10:30:00Z');
    });
});

// ============== DELETE TASK (SOFT) TESTS ==============

describe('deleteTask', () => {
    it('should soft delete a task', async () => {
        const deletedTask: Task = {
            ...mockTask,
            deleted_at: '2024-06-01T00:00:00Z',
            updated_at: '2024-06-01T00:00:00Z',
        };

        (sql as any).mockResolvedValueOnce([deletedTask]);

        const task = await deleteTask(VALID_UUID_1);

        expect(task?.deleted_at).not.toBeNull();
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should return null if task not found', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const task = await deleteTask(NON_EXISTENT_UUID);

        expect(task).toBeNull();
    });

    it('should return null if task already deleted', async () => {
        (sql as any).mockResolvedValueOnce([]);

        const task = await deleteTask(VALID_UUID_2);

        expect(task).toBeNull();
    });

    it('should update both deleted_at and updated_at timestamps', async () => {
        const deletedTask: Task = {
            ...mockTask,
            deleted_at: '2024-06-15T10:30:00Z',
            updated_at: '2024-06-15T10:30:00Z',
        };

        (sql as any).mockResolvedValueOnce([deletedTask]);

        const task = await deleteTask(VALID_UUID_1);

        expect(task?.deleted_at).toBe('2024-06-15T10:30:00Z');
        expect(task?.updated_at).toBe('2024-06-15T10:30:00Z');
    });

    it('should return the deleted task data', async () => {
        const deletedTask: Task = {
            ...mockTask,
            deleted_at: '2024-06-01T00:00:00Z',
        };

        (sql as any).mockResolvedValueOnce([deletedTask]);

        const task = await deleteTask(VALID_UUID_1);

        expect(task?.task_id).toBe(VALID_UUID_1);
        expect(task?.title).toBe('Complete project');
    });
});

// ============== TITLE EXISTS TESTS ==============

describe('titleExists', () => {
    it('should return true if title exists', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: true }]);

        const exists = await titleExists('Existing Title');

        expect(exists).toBe(true);
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should return false if title does not exist', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: false }]);

        const exists = await titleExists('New Title');

        expect(exists).toBe(false);
    });

    it('should be case insensitive', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: true }]);

        const exists = await titleExists('EXISTING TITLE');

        expect(exists).toBe(true);
    });

    it('should exclude specific taskId when checking', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: false }]);

        const exists = await titleExists('Same Title', VALID_UUID_1);

        expect(exists).toBe(false);
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should trim whitespace from title when checking', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: true }]);

        const exists = await titleExists('  Existing Title  ');

        expect(exists).toBe(true);
    });

    it('should only check non-deleted tasks', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: false }]);

        const exists = await titleExists('Deleted Task Title');

        // Should return false because deleted tasks are excluded
        expect(exists).toBe(false);
    });
});


// ============== ERROR HANDLING TESTS ==============

describe('Error Handling', () => {
    it('should handle database error on createTask', async () => {
        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockRejectedValueOnce(new Error('Database connection failed'));

        await expect(
            createTask({
                title: 'Test',
                dueDate: '2024-12-31T23:59:59Z',
            })
        ).rejects.toThrow('Database connection failed');
    });

    it('should handle database error on titleExists check', async () => {
        (sql as any).mockRejectedValueOnce(new Error('Query timeout'));

        await expect(
            createTask({
                title: 'Test',
                dueDate: '2024-12-31T23:59:59Z',
            })
        ).rejects.toThrow('Query timeout');
    });

    it('should handle database error on getTaskById', async () => {
        (sql as any).mockRejectedValueOnce(new Error('Query failed'));

        await expect(getTaskById(VALID_UUID_1)).rejects.toThrow('Query failed');
    });

    it('should handle database error on getAllTasks', async () => {
        (sql as any).mockRejectedValueOnce(new Error('Connection timeout'));

        await expect(getAllTasks()).rejects.toThrow('Connection timeout');
    });

    it('should handle database error on updateTaskStatus', async () => {
        (sql as any).mockRejectedValueOnce(new Error('Update failed'));

        await expect(
            updateTaskStatus({
                taskId: VALID_UUID_1,
                status: 'completed',
            })
        ).rejects.toThrow('Update failed');
    });

    it('should handle database error on deleteTask', async () => {
        (sql as any).mockRejectedValueOnce(new Error('Delete failed'));

        await expect(deleteTask(VALID_UUID_1)).rejects.toThrow('Delete failed');
    });

    it('should handle database error on titleExists', async () => {
        (sql as any).mockRejectedValueOnce(new Error('Query failed'));

        await expect(titleExists('Test Title')).rejects.toThrow('Query failed');
    });
});

// ============== EDGE CASES ==============

describe('Edge Cases', () => {
    it('should handle task with empty description', async () => {
        const taskWithEmptyDesc: Task = {
            ...mockTask,
            description: '',
        };

        (sql as any).mockResolvedValueOnce([taskWithEmptyDesc]);

        const task = await getTaskById(VALID_UUID_1);

        expect(task?.description).toBe('');
    });

    it('should handle task with very long title', async () => {
        const longTitle = 'A'.repeat(255);
        const taskWithLongTitle: Task = {
            ...mockTask,
            title: longTitle,
        };

        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockResolvedValueOnce([taskWithLongTitle]);

        const task = await createTask({
            title: longTitle,
            dueDate: '2024-12-31T23:59:59Z',
        });

        expect(task.title.length).toBe(255);
    });

    it('should handle special characters in title', async () => {
        const specialTitle = "Task with 'quotes' and \"double quotes\" & ampersand";
        const taskWithSpecialChars: Task = {
            ...mockTask,
            title: specialTitle,
        };

        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockResolvedValueOnce([taskWithSpecialChars]);

        const task = await createTask({
            title: specialTitle,
            dueDate: '2024-12-31T23:59:59Z',
        });

        expect(task.title).toBe(specialTitle);
    });

    it('should handle unicode characters in title', async () => {
        const unicodeTitle = '任务 🎯 タスク';
        const taskWithUnicode: Task = {
            ...mockTask,
            title: unicodeTitle,
        };

        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockResolvedValueOnce([taskWithUnicode]);

        const task = await createTask({
            title: unicodeTitle,
            dueDate: '2024-12-31T23:59:59Z',
        });

        expect(task.title).toBe(unicodeTitle);
    });

    it('should handle null due_date', async () => {
        const taskWithNullDate: Task = {
            ...mockTask,
            due_date: null,
        };

        (sql as any).mockResolvedValueOnce([taskWithNullDate]);

        const task = await getTaskById(VALID_UUID_1);

        expect(task?.due_date).toBeNull();
    });

    it('should handle past due_date', async () => {
        const pastDate = '2020-01-01T00:00:00Z';
        const taskWithPastDate: Task = {
            ...mockTask,
            due_date: pastDate,
        };

        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockResolvedValueOnce([taskWithPastDate]);

        const task = await createTask({
            title: 'Task with past date',
            dueDate: pastDate,
        });

        expect(task.due_date).toBe(pastDate);
    });

    it('should handle very long description', async () => {
        const longDescription = 'B'.repeat(10000);
        const taskWithLongDesc: Task = {
            ...mockTask,
            description: longDescription,
        };

        (sql as any).mockResolvedValueOnce([{ exists: false }]);
        (sql as any).mockResolvedValueOnce([taskWithLongDesc]);

        const task = await createTask({
            title: 'Task with long description',
            description: longDescription,
            dueDate: '2024-12-31T23:59:59Z',
        });

        expect(task.description?.length).toBe(10000);
    });

    it('should handle multiple tasks with same status', async () => {
        const tasksWithSameStatus = mockTasks.map((t) => ({
            ...t,
            status: 'pending',
        }));

        (sql as any).mockResolvedValueOnce(tasksWithSameStatus);

        const tasks = await getAllTasks();

        expect(tasks.every((t) => t.status === 'pending')).toBe(true);
    });
});