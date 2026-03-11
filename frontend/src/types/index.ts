export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  user_id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface TaskFormData {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
}

export interface UserCreateFormData {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}

export interface UserUpdateFormData {
  name: string
  email: string
  password: string
  role: 'admin' | 'user'
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
