import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskFormData, TaskStatus } from '@/types'
import * as tasksApi from '@/api/tasks'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTasks() {
    loading.value = true
    error.value = null
    try {
      tasks.value = await tasksApi.fetchTasks()
    } catch {
      error.value = 'タスクの取得に失敗しました。'
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: TaskFormData): Promise<Task> {
    const task = await tasksApi.createTask(data)
    tasks.value.unshift(task)
    return task
  }

  async function updateTask(id: number, data: TaskFormData): Promise<Task> {
    const updated = await tasksApi.updateTask(id, data)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) tasks.value[index] = updated
    return updated
  }

  async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const updated = await tasksApi.updateTaskStatus(id, status)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) tasks.value[index] = updated
    return updated
  }

  async function deleteTask(id: number): Promise<void> {
    await tasksApi.deleteTask(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
  }

  return { tasks, loading, error, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask }
})
