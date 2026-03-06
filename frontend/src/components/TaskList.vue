<template>
  <div class="task-list">
    <div class="task-list-header">
      <h2>Tasks ({{ tasks.length }})</h2>
      <button class="btn btn-primary" @click="$emit('createNew')">
        + New Task
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <span class="loader"></span>
      <p>Loading tasks...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn btn-secondary" @click="$emit('retry')">Retry</button>
    </div>

    <div v-else-if="tasks.length === 0" class="empty-state">
      <p>No tasks found</p>
      <p class="empty-hint">Create your first task to get started!</p>
    </div>

    <div v-else class="tasks-container">
      <TaskItem
        v-for="task in tasks"
        :key="task.taskId"
        :task="task"
        :is-selected="selectedTask?.taskId === task.taskId"
        @select="$emit('selectTask', $event)"
        @delete="$emit('deleteTask', $event)"
        @update-status="
          (taskId, status) => $emit('updateStatus', taskId, status)
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task, TaskStatus } from '../types/task';
import TaskItem from './TaskItem.vue';

defineProps<{
  tasks: Task[];
  selectedTask?: Task | null;
  isLoading?: boolean;
  error?: string | null;
}>();

defineEmits<{
  createNew: [];
  selectTask: [task: Task];
  deleteTask: [taskId: string];
  updateStatus: [taskId: string, status: TaskStatus];
  retry: [];
}>();
</script>

<style scoped>
.task-list {
  flex: 1;
  max-width: 600px;
}

.task-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-list-header h2 {
  margin: 0;
  color: #1a1a1a;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 40px;
  background: #f9fafb;
  border-radius: 8px;
}

.loading-state p,
.error-state p,
.empty-state p {
  color: #6b7280;
  margin: 8px 0;
}

.empty-hint {
  font-size: 14px;
}

.error-state p {
  color: #ef4444;
}

.loader {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.tasks-container {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>
