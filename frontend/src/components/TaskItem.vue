<template>
  <div class="task-item" :class="{ 'task-selected': isSelected }">
    <div class="task-content" @click="$emit('select', task)">
      <div class="task-header">
        <h3 class="task-title">{{ task.title }}</h3>
        <StatusBadge :status="task.status" />
      </div>

      <p v-if="task.description" class="task-description">
        {{ truncateText(task.description, 100) }}
      </p>

      <div class="task-meta">
        <span class="due-date" :class="{ overdue: isOverdue }">
          📅 {{ formatDate(task.dueDate) }}
        </span>
        <span class="created-date">
          Created: {{ formatDate(task.createdAt) }}
        </span>
      </div>
    </div>

    <div class="task-actions">
      <select
        :value="task.status"
        class="status-select"
        @change="handleStatusChange($event)"
        @click.stop
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <button
        class="btn-icon btn-delete"
        title="Delete task"
        @click.stop="$emit('delete', task.taskId)"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Task, TaskStatus } from '../types/task';
import StatusBadge from './StatusBadge.vue';

const props = defineProps<{
  task: Task;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  select: [task: Task];
  delete: [taskId: string];
  updateStatus: [taskId: string, status: TaskStatus];
}>();

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.status === 'completed') return false;
  return new Date(props.task.dueDate) < new Date();
});

const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

const handleStatusChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('updateStatus', props.task.taskId, target.value as TaskStatus);
};
</script>

<style scoped>
.task-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s;
  cursor: pointer;
}

.task-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.task-selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;
}

.task-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  flex: 1;
}

.task-description {
  margin: 0 0 12px 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.due-date {
  color: #6b7280;
}

.due-date.overdue {
  color: #ef4444;
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.status-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: white;
}

.status-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-icon {
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  background: transparent;
}

.btn-delete:hover {
  background-color: #fee2e2;
}
</style>
