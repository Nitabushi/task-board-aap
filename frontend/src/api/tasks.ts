import client from './client'
import type { Task, TaskFormData, TaskStatus } from '@/types'

interface TaskListResponse {
  data: Task[]
}

interface TaskResponse {
  data: Task
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await client.get<TaskListResponse>('/api/tasks')
  return res.data.data
}

export async function createTask(data: TaskFormData): Promise<Task> {
  const res = await client.post<TaskResponse>('/api/tasks', data)
  return res.data.data
}

export async function updateTask(id: number, data: TaskFormData): Promise<Task> {
  const res = await client.put<TaskResponse>(`/api/tasks/${id}`, data)
  return res.data.data
}

export async function updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
  const res = await client.patch<TaskResponse>(`/api/tasks/${id}/status`, { status })
  return res.data.data
}

export async function deleteTask(id: number): Promise<void> {
  await client.delete(`/api/tasks/${id}`)
}
