import { setup, assign, fromPromise } from 'xstate';
import type { Task, CreateTaskInput, TaskStatus } from '../types/tasks';
import { taskApi } from '../api/taskApi';
import { validateCreateTask } from '../schemas/taskSchemas';

// Context type
export interface TaskContext {
    tasks: Task[];
    selectedTask: Task | null;
    error: string | null;
    validationErrors: Record<string, string>;
    isLoading: boolean;
    pendingTask: CreateTaskInput | null;
    pendingUpdate: { taskId: string; status: TaskStatus } | null;
    pendingDelete: string | null;
}

// Event types
export type TaskEvent =
    | { type: 'FETCH_TASKS' }
    | { type: 'CREATE_TASK'; data: CreateTaskInput }
    | { type: 'UPDATE_STATUS'; taskId: string; status: TaskStatus }
    | { type: 'DELETE_TASK'; taskId: string }
    | { type: 'SELECT_TASK'; task: Task | null }
    | { type: 'CLEAR_ERROR' };

// Initial context
const initialContext: TaskContext = {
    tasks: [],
    selectedTask: null,
    error: null,
    validationErrors: {},
    isLoading: false,
    pendingTask: null,
    pendingUpdate: null,
    pendingDelete: null,
};

// Create the machine using XState v5 setup API
export const taskMachine = setup({
    types: {
        context: {} as TaskContext,
        events: {} as TaskEvent,
    },
    actors: {
        fetchTasks: fromPromise(async () => {
            return await taskApi.getAllTasks();
        }),
        createTask: fromPromise(async ({ input }: { input: CreateTaskInput }) => {
            return await taskApi.createTask(input);
        }),
        updateStatus: fromPromise(async ({ input }: { input: { taskId: string; status: TaskStatus } }) => {
            return await taskApi.updateTaskStatus(input.taskId, input.status);
        }),
        deleteTask: fromPromise(async ({ input }: { input: string }) => {
            return await taskApi.deleteTask(input);
        }),
    },
    actions: {
        setLoading: assign({
            isLoading: true,
            error: null,
        }),
        clearLoading: assign({
            isLoading: false,
        }),
        setTasks: assign({
            tasks: ({ event }) => (event as any).output as Task[],
            isLoading: false,
        }),
        setError: assign({
            error: ({ event }) => {
                const errorEvent = event as any;
                if (errorEvent.error) {
                    return errorEvent.error.message || 'An error occurred';
                }
                return 'An error occurred';
            },
            isLoading: false,
        }),
        clearError: assign({
            error: null,
        }),
        selectTask: assign({
            selectedTask: ({ event }) => {
                if (event.type === 'SELECT_TASK') {
                    return event.task;
                }
                return null;
            },
        }),
        clearSelectedTask: assign({
            selectedTask: null,
        }),
        setPendingTask: assign({
            pendingTask: ({ event }) => {
                if (event.type === 'CREATE_TASK') {
                    return event.data;
                }
                return null;
            },
        }),
        clearPendingTask: assign({
            pendingTask: null,
        }),
        setPendingUpdate: assign({
            pendingUpdate: ({ event }) => {
                if (event.type === 'UPDATE_STATUS') {
                    return { taskId: event.taskId, status: event.status };
                }
                return null;
            },
        }),
        clearPendingUpdate: assign({
            pendingUpdate: null,
        }),
        setPendingDelete: assign({
            pendingDelete: ({ event }) => {
                if (event.type === 'DELETE_TASK') {
                    return event.taskId;
                }
                return null;
            },
        }),
        clearPendingDelete: assign({
            pendingDelete: null,
        }),
        validateTask: assign({
            validationErrors: ({ event }) => {
                if (event.type === 'CREATE_TASK') {
                    const result = validateCreateTask(event.data);
                    if (!result.success) {
                        const errors: Record<string, string> = {};
                        // Handle both Zod v3 (errors) and Zod v4 (issues)
                        const zodErrors = (result.error as any).errors || (result.error as any).issues || [];
                        zodErrors.forEach((err: any) => {
                            const path = err.path.join('.');
                            errors[path] = err.message;
                        });
                        return errors;
                    }
                }
                return {};
            },
        }),
        clearValidationErrors: assign({
            validationErrors: {},
        }),
    },
    guards: {
        isValid: ({ context }) => Object.keys(context.validationErrors).length === 0,
    },
}).createMachine({
    id: 'tasks',
    initial: 'idle',
    context: initialContext,
    states: {
        idle: {
            on: {
                FETCH_TASKS: {
                    target: 'fetchingTasks',
                    actions: ['setLoading'],
                },
                CREATE_TASK: {
                    target: 'validating',
                    actions: ['setPendingTask', 'validateTask'],
                },
                UPDATE_STATUS: {
                    target: 'updatingStatus',
                    actions: ['setPendingUpdate', 'setLoading'],
                },
                DELETE_TASK: {
                    target: 'deletingTask',
                    actions: ['setPendingDelete', 'setLoading'],
                },
                SELECT_TASK: {
                    actions: ['selectTask'],
                },
                CLEAR_ERROR: {
                    actions: ['clearError'],
                },
            },
        },

        fetchingTasks: {
            invoke: {
                id: 'fetchTasks',
                src: 'fetchTasks',
                onDone: {
                    target: 'idle',
                    actions: ['setTasks'],
                },
                onError: {
                    target: 'idle',
                    actions: ['setError'],
                },
            },
        },

        validating: {
            always: [
                {
                    target: 'creatingTask',
                    guard: 'isValid',
                    actions: ['setLoading'],
                },
                {
                    target: 'idle',
                    actions: ['clearPendingTask'],
                },
            ],
        },

        creatingTask: {
            invoke: {
                id: 'createTask',
                src: 'createTask',
                input: ({ context }) => context.pendingTask!,
                onDone: {
                    target: 'fetchingTasks',
                    actions: ['clearValidationErrors', 'clearPendingTask'],
                },
                onError: {
                    target: 'idle',
                    actions: ['setError', 'clearPendingTask'],
                },
            },
        },

        updatingStatus: {
            invoke: {
                id: 'updateStatus',
                src: 'updateStatus',
                input: ({ context }) => context.pendingUpdate!,
                onDone: {
                    target: 'fetchingTasks',
                    actions: ['clearPendingUpdate'],
                },
                onError: {
                    target: 'idle',
                    actions: ['setError', 'clearPendingUpdate'],
                },
            },
        },

        deletingTask: {
            invoke: {
                id: 'deleteTask',
                src: 'deleteTask',
                input: ({ context }) => context.pendingDelete!,
                onDone: {
                    target: 'fetchingTasks',
                    actions: ['clearSelectedTask', 'clearPendingDelete'],
                },
                onError: {
                    target: 'idle',
                    actions: ['setError', 'clearPendingDelete'],
                },
            },
        },
    },
});

export type TaskMachine = typeof taskMachine;