<template>
  <div v-if="task" class="task-details">
    <div class="details-header">
      <h2>Task Details</h2>
      <button class="btn-close" @click="$emit('close')">✕</button>
    </div>

    <div class="details-content">
      <div class="detail-row">
        <label>Title</label>
        <p>{{ task.title }}</p>
      </div>

      <div class="detail-row">
        <label>Status</label>
        <StatusBadge :status="task.status" />
      </div>

      <div class="detail-row">
        <label>Description</label>
        <p>{{ task.description || 'No description provided' }}</p>
      </div>

      <div class="detail-row">
        <label>Due Date</label>
        <p :class="{ overdue: isOverdue }">{{ formatDate(task.dueDate) }}</p>
      </div>

      <div class="detail-row">
        <label>Created</label>
        <p>{{ formatDate(task.createdAt) }}</p>
      </div>

      <div class="detail-row">
        <label>Last Updated</label>
        <p>{{ formatDate(task.updatedAt) }}</p>
      </div>

      <div class="detail-row">
        <label>Task ID</label>
        <p class="task-id">{{ task.taskId }}</p>
      </div>
    </div>

    <div class="details-actions">
      <button class="btn btn-danger" @click="$emit('delete', task.taskId)">
        Delete Task
      </button>
    </div>
  </div>

  <div v-else class="no-selection">
    <p>Select a task to view details</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../types/task';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  task: Task | null;
}>();

defineEmits<{
  close: [];
  delete: [taskId: string];
}>();

const isOverdue = computed(() => {
  if (!props.task?.dueDate || props.task.status === 'completed') return false;
  return new Date(props.task.dueDate) < new Date();
});

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.task-details {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 350px;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.details-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #1a1a1a;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-close:hover {
  background-color: #f3f4f6;
}

.detail-row {
  margin-bottom: 16px;
}

.detail-row label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.detail-row p {
  margin: 0;
  color: #1a1a1a;
  font-size: 14px;
}

.task-id {
  font-family: monospace;
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}

.overdue {
  color: #ef4444;
  font-weight: 600;
}

.details-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  width: 100%;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-danger {
  background-color: #fee2e2;
  color: #991b1b;
}

.btn-danger:hover {
  background-color: #fecaca;
}

.no-selection {
  background: #f9fafb;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  width: 350px;
}

.no-selection p {
  color: #6b7280;
  margin: 0;
}
</style>
