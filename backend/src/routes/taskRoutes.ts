import express from 'express';
import {
    handleCreateTask,
    handleGetTaskById,
    handleGetAllTasks,
    handleUpdateTaskStatus,
    handleDeleteTask,

} from '../controllers/taskController';

const router = express.Router();
router.post('/', handleCreateTask);
router.get('/', handleGetAllTasks);
router.get('/:taskId', handleGetTaskById);
router.patch('/:taskId/status', handleUpdateTaskStatus);
router.delete('/:taskId', handleDeleteTask);

export default router;