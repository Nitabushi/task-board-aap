import client from './client'
import type { User, UserCreateFormData, UserUpdateFormData } from '@/types'

interface UserListResponse {
  data: User[]
}

interface UserResponse {
  data: User
}

export async function fetchUsers(): Promise<User[]> {
  const res = await client.get<UserListResponse>('/api/admin/users')
  return res.data.data
}

export async function createUser(data: UserCreateFormData): Promise<User> {
  const res = await client.post<UserResponse>('/api/admin/users', data)
  return res.data.data
}

export async function updateUser(id: number, data: UserUpdateFormData): Promise<User> {
  const res = await client.put<UserResponse>(`/api/admin/users/${id}`, data)
  return res.data.data
}

export async function deleteUser(id: number): Promise<void> {
  await client.delete(`/api/admin/users/${id}`)
}
