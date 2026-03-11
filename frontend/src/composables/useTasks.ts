import { useTasksStore } from '@/stores/tasks'
import type { Task, TaskFormData, TaskStatus } from '@/types'

export function useTasks() {
  const store = useTasksStore()

  async function fetchTasks(): Promise<void> {
    await store.fetchTasks()
  }

  async function createTask(data: TaskFormData): Promise<Task> {
    return store.createTask(data)
  }

  async function updateTask(id: number, data: TaskFormData): Promise<Task> {
    return store.updateTask(id, data)
  }

  async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    return store.updateTaskStatus(id, status)
  }

  async function deleteTask(id: number): Promise<void> {
    return store.deleteTask(id)
  }

  return { fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask }
}
