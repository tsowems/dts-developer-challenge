import { sql } from '../config/database';
import {
  Task,
  CreateTask,
  UpdateTaskStatus,
} from '../types/task';
import { v4 as uuidv4 } from 'uuid';

// ============== CREATE ==============

export const createTask = async ({
  title,
  description = null,
  status = 'pending',
  dueDate,
}: CreateTask): Promise<Task> => {
  // Check for duplicate title
  if (await titleExists(title)) {
    throw new Error(`Task with title "${title}" already exists`);
  }
  const taskId = uuidv4();
  const task = await sql<Task[]>`
    INSERT INTO tasks (task_id, title, description, status, due_date)
    VALUES (${taskId}, ${title.trim()}, ${description}, ${status}, ${dueDate})
    RETURNING *;
  `;
  return task[0];
};

// ============== READ ==============

export const getTaskById = async (
  taskId: string,
  includeDeleted: boolean = false
): Promise<Task | null> => {
  const task = includeDeleted
    ? await sql<Task[]>`
        SELECT * FROM tasks 
        WHERE id = ${taskId}
      `
    : await sql<Task[]>`
        SELECT * FROM tasks 
        WHERE task_id = ${taskId} AND deleted_at IS NULL
      `;

  return task[0] || null;
};

export const getAllTasks = async (
  includeDeleted: boolean = false
): Promise<Task[]> => {
  const tasks = includeDeleted
    ? await sql<Task[]>`
        SELECT * FROM tasks 
        ORDER BY created_at DESC
      `
    : await sql<Task[]>`
        SELECT * FROM tasks 
        WHERE deleted_at IS NULL 
        ORDER BY created_at DESC
      `;

  return tasks;
};



export const getTasksByStatus = async (
  status: string,
  userId?: number
): Promise<Task[]> => {
  if (userId) {
    const tasks = await sql<Task[]>`
      SELECT * FROM tasks 
      WHERE status = ${status} 
        AND user_id = ${userId}
        AND deleted_at IS NULL
      ORDER BY due_date ASC
    `;
    return tasks;
  }

  const tasks = await sql<Task[]>`
    SELECT * FROM tasks 
    WHERE status = ${status} AND deleted_at IS NULL
    ORDER BY due_date ASC
  `;
  return tasks;
};

//============== UPDATE ==============

export const updateTaskStatus = async ({
  taskId,
  status,
}: UpdateTaskStatus): Promise<Task | null> => {
  const task = await sql<Task[]>`
    UPDATE tasks 
    SET status = ${status}, updated_at = CURRENT_TIMESTAMP
    WHERE task_id = ${taskId} AND deleted_at IS NULL
    RETURNING *;
  `;
  return task[0] || null;
};

// ============== Soft delete ==============

export const deleteTask = async (taskId: string): Promise<Task | null> => {
  const task = await sql<Task[]>`
    UPDATE tasks 
    SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE task_id = ${taskId} AND deleted_at IS NULL
    RETURNING *;
  `;
  return task[0] || null;
};


// Check if title already exist
export const titleExists = async (
  title: string,
  excludeTaskId?: string
): Promise<boolean> => {
  const result = excludeTaskId
    ? await sql<[{ exists: boolean }]>`
            SELECT EXISTS(
                SELECT 1 FROM tasks 
                WHERE LOWER(title) = LOWER(${title.trim()}) 
                AND task_id != ${excludeTaskId}
                AND deleted_at IS NULL
            ) as exists
          `
    : await sql<[{ exists: boolean }]>`
            SELECT EXISTS(
                SELECT 1 FROM tasks 
                WHERE LOWER(title) = LOWER(${title.trim()})
                AND deleted_at IS NULL
            ) as exists
          `;

  return result[0].exists;
};

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};


