<template>
  <div class="tasks-view">
    <header class="app-header">
      <h1>HMCTS Task Manager</h1>
    </header>

    <main class="main-content">
      <!-- Task Form Modal -->
      <div v-if="showForm" class="modal-overlay" @click.self="closeForm">
        <TaskForm
          :task="snapshot.context.selectedTask"
          :is-loading="snapshot.context.isLoading"
          :server-errors="snapshot.context.validationErrors"
          @submit="handleCreateTask"
          @cancel="closeForm"
        />
      </div>

      <!-- Error Toast -->
      <div v-if="snapshot.context.error" class="error-toast">
        <p>{{ snapshot.context.error }}</p>
        <button @click="send({ type: 'CLEAR_ERROR' })">✕</button>
      </div>

      <div class="content-wrapper">
        <!-- Task List -->
        <TaskList
          :tasks="snapshot.context.tasks"
          :selected-task="snapshot.context.selectedTask"
          :is-loading="snapshot.context.isLoading"
          :error="snapshot.context.error"
          @create-new="openForm"
          @select-task="handleSelectTask"
          @delete-task="handleDeleteTask"
          @update-status="handleUpdateStatus"
          @retry="send({ type: 'FETCH_TASKS' })"
        />

        <!-- Task Details -->
        <TaskDetails
          :task="snapshot.context.selectedTask"
          @close="handleCloseDetails"
          @delete="handleDeleteTask"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useMachine } from '@xstate/vue';
import { taskMachine } from '../machines/taskMachine';
import type { Task, TaskStatus, CreateTaskInput } from '../types/tasks';
import TaskList from '../components/TaskList.vue';
import TaskForm from '../components/TaskForm.vue';
import TaskDetails from '../components/TaskDetails.vue';

const { snapshot, send } = useMachine(taskMachine);

const showForm = ref(false);

// Fetch tasks on mount
onMounted(() => {
  console.log('Fetching tasks...');
  send({ type: 'FETCH_TASKS' });
});

// Watch for successful task creation to close the form
watch(
  () => snapshot.value,
  (newSnapshot, oldSnapshot) => {
    console.log('State changed:', oldSnapshot?.value, '->', newSnapshot.value);

    // Close form when task creation succeeds (goes from creatingTask to fetchingTasks)
    if (
      showForm.value &&
      oldSnapshot?.value === 'creatingTask' &&
      newSnapshot.value === 'fetchingTasks'
    ) {
      console.log('Task created successfully, closing form');
      showForm.value = false;
    }
  },
);

const openForm = () => {
  send({ type: 'SELECT_TASK', task: null });
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  send({ type: 'SELECT_TASK', task: null });
};

const handleCreateTask = (data: CreateTaskInput) => {
  console.log('Creating task with data:', data);
  send({ type: 'CREATE_TASK', data });
  // ✅ Don't close form here - let the watch handle it after success
};

const handleSelectTask = (task: Task) => {
  send({ type: 'SELECT_TASK', task });
};

const handleCloseDetails = () => {
  send({ type: 'SELECT_TASK', task: null });
};

const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
  send({ type: 'UPDATE_STATUS', taskId, status });
};

const handleDeleteTask = (taskId: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    send({ type: 'DELETE_TASK', taskId });
  }
};
</script>

<style scoped>
.tasks-view {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.app-header {
  background: #1e40af;
  color: white;
  padding: 16px 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.main-content {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-toast {
  position: fixed;
  top: 80px;
  right: 24px;
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
}

.error-toast p {
  margin: 0;
}

.error-toast button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #991b1b;
}

/* Debug panel - to be remove after debugging */
.debug-panel {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
}
</style>
