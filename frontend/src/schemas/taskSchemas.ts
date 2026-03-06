import { z } from 'zod';

export const taskStatusEnum = z.enum(['pending', 'in_progress', 'completed', 'cancelled']);

export const createTaskSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(255, 'Title must be less than 255 characters'),
    description: z
        .string()
        .max(1000, 'Description must be less than 1000 characters')
        .optional()
        .nullable(),
    status: taskStatusEnum.default('pending'),
    dueDate: z
        .string()
        .min(1, 'Due date is required')
        .refine((date) => !isNaN(Date.parse(date)), {
            message: 'Invalid date format',
        }),
});

export const updateTaskStatusSchema = z.object({
    taskId: z.string().uuid('Invalid task ID'),
    status: taskStatusEnum,
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskStatusFormData = z.infer<typeof updateTaskStatusSchema>;

// Validation helper function - handles both Zod v3 and v4
export const validateCreateTask = (data: unknown) => {
    const result = createTaskSchema.safeParse(data);

    if (!result.success) {
        // Normalize error format for both Zod v3 (errors) and v4 (issues)
        const errorArray = (result.error as any).errors || (result.error as any).issues || [];
        return {
            success: false,
            error: {
                errors: errorArray, // For backward compatibility
                issues: errorArray, // For v4 compatibility
            }
        };
    }

    return result;
};

export const validateUpdateTaskStatus = (data: unknown) => {
    const result = updateTaskStatusSchema.safeParse(data);

    if (!result.success) {
        const errorArray = (result.error as any).errors || (result.error as any).issues || [];
        return {
            success: false,
            error: {
                errors: errorArray,
                issues: errorArray,
            }
        };
    }

    return result;
};