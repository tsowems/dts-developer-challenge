<template>
  <div class="task-form">
    <h2>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="title">Title *</label>
        <input
          id="title"
          v-model="formData.title"
          type="text"
          placeholder="Enter task title"
          :class="{ 'input-error': errors.title }"
        />
        <span v-if="errors.title" class="error-message">{{
          errors.title
        }}</span>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="formData.description"
          placeholder="Enter task description (optional)"
          rows="4"
          :class="{ 'input-error': errors.description }"
        ></textarea>
        <span v-if="errors.description" class="error-message">{{
          errors.description
        }}</span>
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="formData.status">
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="form-group">
        <label for="dueDate">Due Date *</label>
        <input
          id="dueDate"
          v-model="formData.dueDate"
          type="datetime-local"
          :class="{ 'input-error': errors.dueDate }"
        />
        <span v-if="errors.dueDate" class="error-message">{{
          errors.dueDate
        }}</span>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="handleCancel">
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" :disabled="isLoading">
          {{
            isLoading ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'
          }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import { createTaskSchema } from '../schemas/taskSchemas';
import type { Task, TaskStatus } from '../types/task';

interface Props {
  task?: Task | null;
  isLoading?: boolean;
  serverErrors?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  task: null,
  isLoading: false,
  serverErrors: () => ({}),
});

const emit = defineEmits<{
  submit: [
    data: {
      title: string;
      description: string | null;
      status: TaskStatus;
      dueDate: string;
    },
  ];
  cancel: [];
}>();

const isEditing = computed(() => !!props.task);

const formData = reactive({
  title: '',
  description: '',
  status: 'pending' as TaskStatus,
  dueDate: '',
});

const errors = reactive<Record<string, string>>({});
const resetForm = () => {
  formData.title = '';
  formData.description = '';
  formData.status = 'pending';
  formData.dueDate = '';
  Object.keys(errors).forEach((key) => delete errors[key]);
};

watch(
  () => props.task,
  (newTask) => {
    if (newTask) {
      formData.title = newTask.title;
      formData.description = newTask.description || '';
      formData.status = newTask.status;
      formData.dueDate = newTask.dueDate
        ? new Date(newTask.dueDate).toISOString().slice(0, 16)
        : '';
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

watch(
  () => props.serverErrors,
  (newErrors) => {
    Object.assign(errors, newErrors);
  },
);

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => delete errors[key]);

  const result = createTaskSchema.safeParse({
    ...formData,
    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : '',
  });

  if (!result.success) {
    // Handle both Zod v3 (errors) and Zod v4 (issues)
    const zodErrors =
      (result.error as any).errors || (result.error as any).issues || [];
    zodErrors.forEach((err: any) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return false;
  }

  return true;
};

const handleSubmit = () => {
  if (!validateForm()) return;

  emit('submit', {
    title: formData.title.trim(),
    description: formData.description.trim() || null,
    status: formData.status,
    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : '',
  });
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<style scoped>
.task-form {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

h2 {
  margin: 0 0 24px 0;
  color: #1a1a1a;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
  box-sizing: border-box;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-error {
  border-color: #ef4444;
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
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

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}
</style>
