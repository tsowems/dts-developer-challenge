<template>
  <span :class="['status-badge', statusClass]">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TaskStatus } from '../types/task';

const props = defineProps<{
  status: TaskStatus;
}>();

const statusText = computed(() => {
  const statusMap: Record<TaskStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return statusMap[props.status] || props.status;
});

const statusClass = computed(() => {
  return `status-${props.status}`;
});
</script>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-in_progress {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-completed {
  background-color: #d1fae5;
  color: #065f46;
}

.status-cancelled {
  background-color: #fee2e2;
  color: #991b1b;
}
</style>
