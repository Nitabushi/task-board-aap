<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import TaskBoard from '@/components/TaskBoard.vue'
import TaskModal from '@/components/TaskModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task, TaskStatus, TaskFormData } from '@/types'

const tasksStore = useTasksStore()

const showModal = ref(false)
const selectedTask = ref<Task | null>(null)
const showConfirm = ref(false)
const taskToDelete = ref<Task | null>(null)
const modalRef = ref<InstanceType<typeof TaskModal> | null>(null)

onMounted(() => {
  tasksStore.fetchTasks()
})

function openCreateModal() {
  selectedTask.value = null
  showModal.value = true
}

function openEditModal(task: Task) {
  selectedTask.value = task
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedTask.value = null
}

async function handleSubmit(data: TaskFormData) {
  try {
    if (selectedTask.value) {
      await tasksStore.updateTask(selectedTask.value.id, data)
    } else {
      await tasksStore.createTask(data)
    }
    closeModal()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { errors?: Record<string, string[]> } } }
    if (err.response?.data?.errors) {
      modalRef.value?.setServerErrors(err.response.data.errors)
    }
  }
}

function openDeleteConfirm(task: Task) {
  taskToDelete.value = task
  showConfirm.value = true
  showModal.value = false
}

async function confirmDelete() {
  if (!taskToDelete.value) return
  await tasksStore.deleteTask(taskToDelete.value.id)
  showConfirm.value = false
  taskToDelete.value = null
}

async function handleStatusChange(taskId: number, status: TaskStatus) {
  await tasksStore.updateTaskStatus(taskId, status)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-800">タスクボード</h2>
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          @click="openCreateModal"
        >
          + タスク作成
        </button>
      </div>

      <div v-if="tasksStore.loading" class="text-center py-12 text-gray-500">読み込み中...</div>
      <div v-else-if="tasksStore.error" class="text-center py-12 text-red-500">
        {{ tasksStore.error }}
      </div>
      <TaskBoard
        v-else
        :tasks="tasksStore.tasks"
        @click-task="openEditModal"
        @change-status="handleStatusChange"
      />
    </main>

    <TaskModal
      v-if="showModal"
      ref="modalRef"
      :task="selectedTask"
      @submit="handleSubmit"
      @delete="openDeleteConfirm"
      @close="closeModal"
    />

    <ConfirmDialog
      v-if="showConfirm"
      title="タスクの削除"
      message="このタスクを削除してもよろしいですか？"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </div>
</template>
