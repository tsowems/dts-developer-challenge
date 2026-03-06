import { Request, Response } from 'express';
import {
    createTask,
    getTaskById,
    getAllTasks,
    updateTaskStatus,
    deleteTask
} from '../models/Task';

// ============== CREATE ==============

export const handleCreateTask = async (req: Request, res: Response) => {
    try {
        const { title, description, status, dueDate } = req.body;
        console.log(title, description, status, dueDate);
        if (!title || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Title and due date are required',
            });
        }

        const task = await createTask({
            title,
            description,
            status,
            dueDate
        });

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task,

        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'

        if (message.includes('already exists')) {
            return res.status(500).json({
                success: false,
                error: message,
            });
        }
    }
};

// ============== READ ==============

export const handleGetTaskById = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;

        const task = await getTaskById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: task,
        });
    } catch (error) {
        console.error('Error fetching task:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

export const handleGetAllTasks = async (req: Request, res: Response) => {
    try {
        const { includeDeleted } = req.query;

        const tasks = await getAllTasks(includeDeleted === 'true');

        return res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length,
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ============== UPDATE ==============

export const handleUpdateTaskStatus = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required',
            });
        }

        const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const existingTask = await getTaskById(taskId);

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const task = await updateTaskStatus({
            taskId,
            status,
        });

        return res.status(200).json({
            success: true,
            message: 'Task status updated successfully',
            data: task,
        });
    } catch (error) {
        console.error('Error updating task status:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

// ============== DELETE (SOFT) ==============

export const handleDeleteTask = async (req: Request, res: Response) => {
    try {
        const { taskId } = req.params;

        const existingTask = await getTaskById(taskId);

        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const task = await deleteTask(taskId);

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: task,
        });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};

/**
 * Confirm UUID format
 */
export const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};